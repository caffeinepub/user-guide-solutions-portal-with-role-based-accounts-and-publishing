import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type PostId = Nat;
  var nextPostId : PostId = 0;

  type Draft = {
    title : Text;
    content : Text;
    tags : [Text];
  };

  public type Post = {
    title : Text;
    content : Text;
    tags : [Text];
    author : Principal;
    created : Int;
    lastUpdated : Int;
    isPublished : Bool;
  };

  module Post {
    public func compare(a : Post, b : Post) : Order.Order {
      Text.compare(a.title, b.title);
    };

    public func compareByDateAsc(a : Post, b : Post) : Order.Order {
      if (a.created < b.created) { #less } else if (a.created > b.created) {
        #greater;
      } else { #equal };
    };

    public func compareByDateDesc(a : Post, b : Post) : Order.Order {
      switch (Post.compareByDateAsc(a, b)) {
        case (#greater) { #less };
        case (#less) { #greater };
        case (#equal) { #equal };
      };
    };
  };

  let postStates = Map.empty<Nat, Post>();
  let blogStates = Map.empty<Nat, Post>();
  let drafts = Map.empty<Principal, List.List<Draft>>();
  let taggedPosts = Map.empty<Text, Set.Set<Nat>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type PostUpdate = {
    #allPosts;
    #untaggedPosts;
    #tag : Text;
    #post : Nat;
    #blogs;
  };

  func validateTitle(title : Text) : () {
    if (title.size() < 1) { Runtime.trap("A title is required.") };
    if (title.size() > 100) {
      Runtime.trap("Titles can have at most 100 characters.");
    };
  };

  func validateTags(tags : [Text]) : () {
    if (tags.size() > 3) {
      Runtime.trap("Maximum number of tags is 3.");
    };
    if (
      tags.any(
        func(tag) { tag.size() > 20 },
      )
    ) {
      Runtime.trap("Tags are limited to 20 characters.");
    };
  };

  func filterByAuthor(posts : Map.Map<Nat, Post>, author : Principal) : [Post] {
    let authorPosts = posts.entries().filter(
      func((_, post)) { post.author == author }
    ).map(
      func((_, post)) { post }
    );
    authorPosts.toArray().sort();
  };

  func canModifyPost(caller : Principal, post : Post) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    if (post.author == caller) {
      return true;
    };
    false;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Draft Management
  public query ({ caller }) func getCallerDrafts() : async [Draft] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view drafts");
    };
    switch (drafts.get(caller)) {
      case (null) { [] };
      case (?draftList) { draftList.toArray() };
    };
  };

  public shared ({ caller }) func saveDraft(title : Text, content : Text, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save drafts");
    };

    validateTitle(title);
    validateTags(tags);

    let newDraft : Draft = { title; content; tags };
    switch (drafts.get(caller)) {
      case (?currentDrafts) {
        currentDrafts.add(newDraft);
      };
      case (null) {
        let draftList = List.empty<Draft>();
        draftList.add(newDraft);
        drafts.add(caller, draftList);
      };
    };
  };

  public shared ({ caller }) func removeDraft(draftIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove drafts");
    };

    switch (drafts.get(caller)) {
      case (null) {
        Runtime.trap("No drafts exist for this caller. Cannot delete draft.");
      };
      case (?callerDraftList) {
        let draftList = callerDraftList.toArray();
        if (draftIndex >= draftList.size()) {
          Runtime.trap("Draft with index " # debug_show (draftIndex) # " does not exist. Cannot delete.");
        };
        let newDraftList : [Draft] = draftList.sliceToArray(0, draftIndex).concat(draftList.sliceToArray(draftIndex + 1, draftList.size()));
        switch (newDraftList.size()) {
          case (0) { drafts.remove(caller) };
          case (_) {
            drafts.add(caller, List.fromArray<Draft>(newDraftList));
          };
        };
      };
    };
  };

  // Blog Management
  public query ({ caller }) func getBlogsByMe() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their blogs");
    };
    filterByAuthor(blogStates, caller);
  };

  public query func getBlogs() : async [Post] {
    // Public access - no authorization needed
    blogStates.values().toArray().sort();
  };

  public shared ({ caller }) func submitBlog(title : Text, content : Text, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit blogs");
    };

    validateTitle(title);
    validateTags(tags);

    let newBlog : Post = {
      title;
      content;
      tags;
      author = caller;
      created = Time.now();
      lastUpdated = Time.now();
      isPublished = false;
    };
    blogStates.add(nextPostId, newBlog);

    for (tag in tags.values()) {
      switch (taggedPosts.get(tag)) {
        case (?currentIds) {
          currentIds.add(nextPostId);
        };
        case (null) {
          let idSet = Set.fromIter<Nat>([nextPostId].values());
          taggedPosts.add(tag, idSet);
        };
      };
    };

    nextPostId += 1;
  };

  // Post Management
  public query ({ caller }) func getPostsByMe() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their posts");
    };
    filterByAuthor(postStates, caller);
  };

  public query ({ caller }) func getAllPosts() : async ?[Post] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Admins can get all posts");
    };
    ?postStates.values().toArray().sort();
  };

  public query func getPosts() : async [Post] {
    // Public access - no authorization needed
    postStates.values().toArray().sort();
  };

  public query func getTaggedPostIds(tag : Text) : async ?[PostId] {
    // Public access - no authorization needed
    switch (taggedPosts.get(tag)) {
      case (?ids) { ?ids.toArray() };
      case (null) { null };
    };
  };

  public query func getUntaggedPosts() : async [PostId] {
    // Public access - no authorization needed
    postStates.entries().map(func((id, _)) { id }).toArray();
  };

  public shared ({ caller }) func submitPost(title : Text, content : Text, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit posts");
    };

    validateTitle(title);
    validateTags(tags);

    let newPost : Post = {
      title;
      content;
      tags;
      author = caller;
      created = Time.now();
      lastUpdated = Time.now();
      isPublished = false;
    };
    postStates.add(nextPostId, newPost);

    for (tag in tags.values()) {
      switch (taggedPosts.get(tag)) {
        case (?currentIds) {
          currentIds.add(nextPostId);
        };
        case (null) {
          let idSet = Set.fromIter<Nat>([nextPostId].values());
          taggedPosts.add(tag, idSet);
        };
      };
    };

    nextPostId += 1;
  };

  public shared ({ caller }) func updatePost(postId : PostId, title : Text, content : Text, tags : [Text]) : async () {
    let post = switch (postStates.get(postId)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("Post with id " # debug_show (postId) # " does not exist.");
      };
    };

    if (not canModifyPost(caller, post)) {
      Runtime.trap("Unauthorized: Only Admins or the post author can update this post");
    };

    if (post.isPublished and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Admins can update published posts");
    };

    validateTitle(title);
    validateTags(tags);

    // Remove old tags
    for (oldTag in post.tags.values()) {
      switch (taggedPosts.get(oldTag)) {
        case (?ids) {
          ids.remove(postId);
          if (ids.size() == 0) {
            taggedPosts.remove(oldTag);
          };
        };
        case (null) {};
      };
    };

    // Add new tags
    for (tag in tags.values()) {
      switch (taggedPosts.get(tag)) {
        case (?currentIds) {
          currentIds.add(postId);
        };
        case (null) {
          let idSet = Set.fromIter<Nat>([postId].values());
          taggedPosts.add(tag, idSet);
        };
      };
    };

    let updatedPost : Post = {
      title;
      content;
      tags;
      author = post.author;
      created = post.created;
      lastUpdated = Time.now();
      isPublished = post.isPublished;
    };
    postStates.add(postId, updatedPost);
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    let post = switch (postStates.get(postId)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("Post with id " # debug_show (postId) # " does not exist.");
      };
    };

    if (not canModifyPost(caller, post)) {
      Runtime.trap("Unauthorized: Only Admins or the post author can delete this post");
    };

    if (post.isPublished and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Admins can delete published posts");
    };

    // Remove tags
    for (tag in post.tags.values()) {
      switch (taggedPosts.get(tag)) {
        case (?ids) {
          ids.remove(postId);
          if (ids.size() == 0) {
            taggedPosts.remove(tag);
          };
        };
        case (null) {};
      };
    };

    postStates.remove(postId);
  };

  public shared ({ caller }) func publish(postId : PostId) : async () {
    let post = switch (postStates.get(postId)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("Post with id " # debug_show (postId) # " does not exist.");
      };
    };

    if (not canModifyPost(caller, post)) {
      Runtime.trap("Unauthorized: Only Admins or the post author can publish this post");
    };

    if (post.isPublished) {
      Runtime.trap("Post is already published");
    };

    // Validate post content
    validateTitle(post.title);
    validateTags(post.tags);

    let publishedPost : Post = {
      title = post.title;
      content = post.content;
      tags = post.tags;
      author = post.author;
      created = post.created;
      lastUpdated = Time.now();
      isPublished = true;
    };
    postStates.add(postId, publishedPost);
  };

  public shared ({ caller }) func unpublish(postId : PostId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Admins can unpublish posts");
    };

    let post = switch (postStates.get(postId)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("Post with id " # debug_show (postId) # " does not exist.");
      };
    };

    if (not post.isPublished) {
      Runtime.trap("Post is not published");
    };

    let unpublishedPost : Post = {
      title = post.title;
      content = post.content;
      tags = post.tags;
      author = post.author;
      created = post.created;
      lastUpdated = Time.now();
      isPublished = false;
    };
    postStates.add(postId, unpublishedPost);
  };
};
