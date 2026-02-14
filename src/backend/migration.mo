import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type OldDraft = {
    title : Text;
    content : Text;
    tags : [Text];
  };

  type OldPost = {
    title : Text;
    content : Text;
    tags : [Text];
    author : Principal;
    created : Int;
    lastUpdated : Int;
    isPublished : Bool;
  };

  type OldUserProfile = {
    name : Text;
    role : Text;
  };

  type OldActor = {
    nextPostId : Nat;
    postStates : Map.Map<Nat, OldPost>;
    blogStates : Map.Map<Nat, OldPost>;
    drafts : Map.Map<Principal, List.List<OldDraft>>;
    taggedPosts : Map.Map<Text, Set.Set<Nat>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    nextPostId : Nat;
    postStates : Map.Map<Nat, OldPost>;
    blogStates : Map.Map<Nat, OldPost>;
    drafts : Map.Map<Principal, List.List<OldDraft>>;
    taggedPosts : Map.Map<Text, Set.Set<Nat>>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewUserProfile = {
    name : Text;
  };

  public func run(old : OldActor) : NewActor {
    let newProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        { name = oldProfile.name };
      }
    );

    {
      old with
      userProfiles = newProfiles
    };
  };
};
