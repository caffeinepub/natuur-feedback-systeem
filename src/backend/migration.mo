import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

module {
  type FeedbackEntry = {
    id : Nat;
    school : Text;
    targetClass : Text;
    pedagogicalAlignment : Nat;
    interactionMethod : Nat;
    sensoryExperience : Nat;
    knowledgeTransfer : Nat;
    timestamp : Int;
    impactMoment : Text;
    environmentalContribution : Text;
    additionalComments : Text;
  };

  type Question = {
    id : Nat;
    title : Text;
    description : Text;
  };

  type ContextExample = {
    id : Nat;
    school : Text;
    targetClass : Text;
    exampleText : Text;
  };

  type Activity = {
    id : Nat;
    school : Text;
    targetClass : Text;
    name : Text;
    description : Text;
  };

  type UserProfile = {
    name : Text;
  };

  // Old Actor Type
  type OldActor = {
    feedbackEntries : Map.Map<Nat, FeedbackEntry>;
    questions : Map.Map<Nat, Question>;
    contextExamples : Map.Map<Nat, ContextExample>;
    activities : Map.Map<Nat, Activity>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextFeedbackId : Nat;
    nextQuestionId : Nat;
    nextExampleId : Nat;
    nextActivityId : Nat;
    activitiesSeeded : Bool;
  };

  // New Actor Type
  type NewActor = {
    feedbackEntries : Map.Map<Nat, FeedbackEntry>;
    questions : Map.Map<Nat, Question>;
    contextExamples : Map.Map<Nat, ContextExample>;
    activities : Map.Map<Nat, Activity>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextFeedbackId : Nat;
    nextQuestionId : Nat;
    nextExampleId : Nat;
    nextActivityId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      feedbackEntries = old.feedbackEntries;
      questions = old.questions;
      contextExamples = old.contextExamples;
      activities = old.activities;
      userProfiles = old.userProfiles;
      nextFeedbackId = old.nextFeedbackId;
      nextQuestionId = old.nextQuestionId;
      nextExampleId = old.nextExampleId;
      nextActivityId = old.nextActivityId;
    };
  };
};
