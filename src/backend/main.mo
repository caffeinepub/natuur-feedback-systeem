import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Migration "migration";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Types ---
  public type FeedbackEntry = {
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

  public type Question = {
    id : Nat;
    title : Text;
    description : Text;
  };

  public type ContextExample = {
    id : Nat;
    school : Text;
    targetClass : Text;
    exampleText : Text;
  };

  public type Activity = {
    id : Nat;
    school : Text;
    targetClass : Text;
    name : Text;
    description : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type Score = Nat; // 1-5
  public type Timestamp = Int;

  public type ScoreCategory = {
    pedagogicalAlignment : Score;
    interactionMethod : Score;
    sensoryExperience : Score;
    knowledgeTransfer : Score;
  };

  public type ContextStats = {
    totalEntries : Nat;
    averagePedagogicalAlignment : Float;
    averageInteractionMethod : Float;
    averageSensoryExperience : Float;
    averageKnowledgeTransfer : Float;
  };

  // --- Session-based Admin Authentication ---
  var adminUsername : Text = "admin";
  var adminPassword : Text = "NatuurAdmin2024!";
  let sessions = Map.empty<Text, Int>(); // token -> expiry timestamp
  let SESSION_DURATION_NS : Int = 8 * 60 * 60 * 1_000_000_000; // 8 hours in nanoseconds

  var nextFeedbackId = 1;
  var nextQuestionId = 1;
  var nextExampleId = 1;
  var nextActivityId = 1;

  let feedbackEntries = Map.empty<Nat, FeedbackEntry>();
  let questions = Map.empty<Nat, Question>();
  let contextExamples = Map.empty<Nat, ContextExample>();
  let activities = Map.empty<Nat, Activity>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func compareByTimestamp(a : FeedbackEntry, b : FeedbackEntry) : Order.Order {
    Int.compare(a.timestamp, b.timestamp);
  };

  // --- Admin Session Management ---
  func generateToken() : Text {
    let now = Time.now();
    let entropy = now.toText();
    entropy # "-" # sessions.size().toText();
  };

  public shared func adminLogin(username : Text, password : Text) : async ?Text {
    if (username == adminUsername and password == adminPassword) {
      let token = generateToken();
      let expiry = Time.now() + SESSION_DURATION_NS;
      sessions.add(token, expiry);
      ?token;
    } else {
      null;
    };
  };

  public query func isSessionValid(token : Text) : async Bool {
    switch (sessions.get(token)) {
      case (null) { false };
      case (?expiry) { Time.now() < expiry };
    };
  };

  public shared func adminLogout(token : Text) : async () {
    sessions.remove(token);
  };

  public shared func changeAdminPassword(token : Text, newUsername : Text, newPassword : Text) : async Bool {
    if (not checkSessionValid(token)) {
      return false;
    };

    if (newUsername.size() < 3 or newPassword.size() < 6) {
      return false;
    };

    adminUsername := newUsername;
    adminPassword := newPassword;
    true;
  };

  // Private helper to check session validity (traps if invalid)
  func checkSession(token : Text) {
    switch (sessions.get(token)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?expiry) {
        if (Time.now() >= expiry) {
          sessions.remove(token);
          Runtime.trap("Unauthorized: Session expired");
        };
      };
    };
  };

  // Private helper to check session validity (returns bool)
  func checkSessionValid(token : Text) : Bool {
    switch (sessions.get(token)) {
      case (null) { false };
      case (?expiry) { Time.now() < expiry };
    };
  };

  // --- Feedback ---
  public shared func submitFeedback(
    school : Text,
    targetClass : Text,
    pedagogicalAlignment : Score,
    interactionMethod : Score,
    sensoryExperience : Score,
    knowledgeTransfer : Score,
    impactMoment : Text,
    environmentalContribution : Text,
    additionalComments : Text,
  ) : async () {
    if (not (isValidScore(pedagogicalAlignment)) or
      not (isValidScore(interactionMethod)) or
      not (isValidScore(sensoryExperience)) or
      not (isValidScore(knowledgeTransfer)))
    {
      Runtime.trap("Scores must be between 1 and 5");
    };

    let newEntry : FeedbackEntry = {
      id = nextFeedbackId;
      school;
      targetClass;
      pedagogicalAlignment;
      interactionMethod;
      sensoryExperience;
      knowledgeTransfer;
      timestamp = Time.now();
      impactMoment;
      environmentalContribution;
      additionalComments;
    };

    feedbackEntries.add(nextFeedbackId, newEntry);
    nextFeedbackId += 1;
  };

  public query func getAllFeedback(token : Text) : async [FeedbackEntry] {
    switch (sessions.get(token)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?expiry) {
        if (Time.now() >= expiry) {
          Runtime.trap("Unauthorized: Session expired");
        };
      };
    };
    feedbackEntries.values().toArray();
  };

  public query func getFeedbackBySchool(school : Text) : async [FeedbackEntry] {
    feedbackEntries.values().toArray().filter(
      func(entry) { entry.school == school }
    );
  };

  public query func getFeedbackByDateRange(startTimestamp : Timestamp, endTimestamp : Timestamp) : async [FeedbackEntry] {
    feedbackEntries.values().toArray().filter(
      func(entry) { entry.timestamp >= startTimestamp and entry.timestamp <= endTimestamp }
    );
  };

  public query func getFeedbackByClass(school : Text, targetClass : Text) : async [FeedbackEntry] {
    feedbackEntries.values().toArray().filter(
      func(entry) {
        entry.school == school and entry.targetClass == targetClass
      }
    );
  };

  public query func getFeedbackByScoreRange(minScore : Score, maxScore : Score) : async [FeedbackEntry] {
    feedbackEntries.values().toArray().filter(
      func(entry) {
        entry.pedagogicalAlignment >= minScore and entry.pedagogicalAlignment <= maxScore and
        entry.interactionMethod >= minScore and entry.interactionMethod <= maxScore and
        entry.sensoryExperience >= minScore and entry.sensoryExperience <= maxScore and
        entry.knowledgeTransfer >= minScore and entry.knowledgeTransfer <= maxScore
      }
    );
  };

  public query func getFeedbackByCategory(category : Text) : async [FeedbackEntry] {
    feedbackEntries.values().toArray();
  };

  func calculateAverage(scores : [Score]) : Float {
    if (scores.size() == 0) { return 0 };
    let total = scores.foldLeft(0, func(acc, score) { acc + score });
    total.toFloat() / scores.size().toInt().toFloat();
  };

  // --- Statistics ---
  public query func getCategoryStatsBySchool(school : Text) : async ?ContextStats {
    let entries = feedbackEntries.values().toArray().filter(
      func(entry) { entry.school == school }
    );

    let totalCount = entries.size();
    if (totalCount == 0) { return null };

    let pedagogicalScores = entries.map(
      func(entry) { entry.pedagogicalAlignment }
    );

    let interactionScores = entries.map(
      func(entry) { entry.interactionMethod }
    );

    let sensoryScores = entries.map(
      func(entry) { entry.sensoryExperience }
    );

    let knowledgeScores = entries.map(
      func(entry) { entry.knowledgeTransfer }
    );

    ?{
      totalEntries = totalCount;
      averagePedagogicalAlignment = calculateAverage(pedagogicalScores);
      averageInteractionMethod = calculateAverage(interactionScores);
      averageSensoryExperience = calculateAverage(sensoryScores);
      averageKnowledgeTransfer = calculateAverage(knowledgeScores);
    };
  };

  // --- Questions ---
  public shared func addQuestion(token : Text, title : Text, description : Text) : async () {
    checkSession(token);

    let question : Question = {
      id = nextQuestionId;
      title;
      description;
    };

    questions.add(nextQuestionId, question);
    nextQuestionId += 1;
  };

  public shared func updateQuestion(token : Text, id : Nat, title : Text, description : Text) : async () {
    checkSession(token);

    switch (questions.get(id)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) {
        let updated : Question = {
          id;
          title;
          description;
        };
        questions.add(id, updated);
      };
    };
  };

  public shared func deleteQuestion(token : Text, id : Nat) : async () {
    checkSession(token);
    questions.remove(id);
  };

  public query func getAllQuestions() : async [Question] {
    questions.values().toArray();
  };

  public query func getQuestionById(id : Nat) : async ?Question {
    questions.get(id);
  };

  // --- Context Examples ---
  public shared func addContextExample(token : Text, school : Text, targetClass : Text, exampleText : Text) : async () {
    checkSession(token);

    let example : ContextExample = {
      id = nextExampleId;
      school;
      targetClass;
      exampleText;
    };

    contextExamples.add(nextExampleId, example);
    nextExampleId += 1;
  };

  public shared func updateContextExample(token : Text, id : Nat, school : Text, targetClass : Text, exampleText : Text) : async () {
    checkSession(token);

    switch (contextExamples.get(id)) {
      case (null) { Runtime.trap("Context example not found") };
      case (?_) {
        let updated : ContextExample = {
          id;
          school;
          targetClass;
          exampleText;
        };
        contextExamples.add(id, updated);
      };
    };
  };

  public shared func deleteContextExample(token : Text, id : Nat) : async () {
    checkSession(token);
    contextExamples.remove(id);
  };

  public query func getAllContextExamples() : async [ContextExample] {
    contextExamples.values().toArray();
  };

  public query func getContextExamplesBySchoolAndClass(school : Text, targetClass : Text) : async [ContextExample] {
    contextExamples.values().toArray().filter(
      func(example) {
        example.school == school and example.targetClass == targetClass
      }
    );
  };

  public query func getContextExampleById(id : Nat) : async ?ContextExample {
    contextExamples.get(id);
  };

  // --- Activities ---
  public shared func addActivity(
    token : Text,
    school : Text,
    targetClass : Text,
    name : Text,
    description : Text,
  ) : async () {
    checkSession(token);

    let activity : Activity = {
      id = nextActivityId;
      school;
      targetClass;
      name;
      description;
    };

    activities.add(nextActivityId, activity);
    nextActivityId += 1;
  };

  public shared func updateActivity(
    token : Text,
    id : Nat,
    school : Text,
    targetClass : Text,
    name : Text,
    description : Text,
  ) : async () {
    checkSession(token);

    switch (activities.get(id)) {
      case (null) { Runtime.trap("Activity not found") };
      case (?_) {
        let updated : Activity = {
          id;
          school;
          targetClass;
          name;
          description;
        };
        activities.add(id, updated);
      };
    };
  };

  public shared func deleteActivity(token : Text, id : Nat) : async () {
    checkSession(token);
    activities.remove(id);
  };

  public query func getAllActivities() : async [Activity] {
    activities.values().toArray();
  };

  public query func getActivitiesBySchoolAndClass(school : Text, targetClass : Text) : async [Activity] {
    activities.values().toArray().filter(
      func(activity) {
        activity.school == school and activity.targetClass == targetClass
      }
    );
  };

  public query func getActivityById(id : Nat) : async ?Activity {
    activities.get(id);
  };

  // --- Seed Data ---
  public shared func seedInitialData(token : Text) : async () {
    checkSession(token);

    // Only seed if no questions exist
    if (questions.size() == 0) {
      let questionData = [
        (
          "Pedagogische Aansluiting",
          "Hoe goed sloot het traject aan bij de leefwereld en het niveau van de leerlingen?",
        ),
        (
          "Interactie & Methodiek",
          "Was er doorheen het jaar een goede balans tussen observatie en actie?",
        ),
        (
          "Zintuiglijke Beleving",
          "In welke mate werden de zintuigen van de leerlingen geprikkeld?",
        ),
        (
          "Kennisoverdracht",
          "Hoe effectief werd de natuurkennis (kringloop, biodiversiteit) overgebracht doorheen het traject?",
        ),
        (
          "Versterking leerdoelen",
          "In hoeverre zijn de gestelde doelen/leerresultaten daadwerkelijk bereikt?",
        ),
        (
          "Thematische integratie",
          "Hoe goed werden nieuwe thema's/activiteiten geïntegreerd in het bestaande lessenpakket?",
        ),
      ];

      for ((title, description) in questionData.vals()) {
        let question : Question = {
          id = nextQuestionId;
          title;
          description;
        };
        questions.add(nextQuestionId, question);
        nextQuestionId += 1;
      };
    };

    // Seed activities if empty
    if (activities.size() == 0) {
      let activityData = [
        ("Klavertje Vier", "Groep 1-2", "Seizoenstafel", "Natuurlijke materialen verzamelen en ordenen per seizoen"),
        ("Klavertje Vier", "Groep 3-4", "Insectenhotel bouwen", "Samen een insectenhotel maken voor de schooltuin"),
        ("Droomboom", "Groep 5-6", "Composteren", "Leren over de kringloop door compost te maken"),
        ("Droomboom", "Groep 7-8", "Biodiversiteit onderzoek", "Soorten tellen en documenteren in de omgeving"),
        ("Leidstar", "Groep 1-2", "Vogelhuisjes", "Vogelhuisjes maken en ophangen"),
        ("Leidstar", "Groep 3-4", "Moestuin", "Groenten kweken in de schoolmoestuin"),
      ];

      for ((school, targetClass, name, description) in activityData.vals()) {
        let activity : Activity = {
          id = nextActivityId;
          school;
          targetClass;
          name;
          description;
        };
        activities.add(nextActivityId, activity);
        nextActivityId += 1;
      };
    };
  };

  // Private helper to validate score
  func isValidScore(score : Score) : Bool {
    score >= 1 and score <= 5;
  };

  // User Profile Functions (using AccessControl for Principal-based user management)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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
};
