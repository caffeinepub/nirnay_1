import Int "mo:core/Int";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Init authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type EvidenceID = Nat;
  type EmergencyContactID = Nat;
  type LegalArticleID = Nat;

  type EvidenceRecord = {
    id : EvidenceID;
    incidentType : Text;
    description : Text;
    notes : ?Text;
    timestamp : Int;
    owner : Principal;
  };

  module EvidenceRecord {
    public func compareByTimestamp(record1 : EvidenceRecord, record2 : EvidenceRecord) : Order.Order {
      Int.compare(record2.timestamp, record1.timestamp);
    };
  };

  type EmergencyContact = {
    id : EmergencyContactID;
    name : Text;
    phoneNumber : Text;
    owner : Principal;
  };

  type SOSTrigger = {
    user : Principal;
    isActive : Bool;
    timestamp : Int;
  };

  type LegalArticle = {
    id : LegalArticleID;
    title : Text;
    category : Text;
    content : Text;
  };

  type UserProfile = {
    user : Principal;
    displayName : Text;
    pinEnabled : Bool;
    pinHash : ?Text;
    isSosActive : Bool;
    sosTimestamp : ?Int;
  };

  type Updates = {
    displayName : Text;
    pinEnabled : Bool;
    pinHash : Text;
  };

  var nextEvidenceID : EvidenceID = 1;
  var nextContactID : EmergencyContactID = 1;
  var nextArticleID : LegalArticleID = 1;

  let evidenceStore = Map.empty<EvidenceID, EvidenceRecord>();
  let contactsStore = Map.empty<EmergencyContactID, EmergencyContact>();
  let sosTriggers = Set.empty<Principal>();
  let articleStore = Map.empty<LegalArticleID, LegalArticle>();
  let profiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getDisplayName() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access display name");
    };
    switch (profiles.get(caller)) {
      case (null) { "" };
      case (?profile) { profile.displayName };
    };
  };

  public shared ({ caller }) func updateDisplayName(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update display name");
    };
    if (displayName.size() == 0) { Runtime.trap("Display name should not be empty.") };
    let currentProfile = switch (profiles.get(caller)) {
      case (null) {
        {
          user = caller;
          displayName;
          pinEnabled = false;
          pinHash = null;
          isSosActive = false;
          sosTimestamp = null;
        };
      };
      case (?profile) {
        { profile with displayName };
      };
    };
    profiles.add(caller, currentProfile);
  };

  public shared ({ caller }) func addContact(name : Text, phoneNumber : Text) : async EmergencyContactID {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add contacts");
    };
    let id = nextContactID;
    let contact : EmergencyContact = {
      id;
      name;
      phoneNumber;
      owner = caller;
    };
    contactsStore.add(id, contact);
    nextContactID += 1;
    id;
  };

  public query ({ caller }) func listUserContacts() : async [EmergencyContact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list contacts");
    };
    contactsStore.values().toArray().filter(
      func(contact) {
        contact.owner == caller;
      }
    );
  };

  public shared ({ caller }) func removeContact(contactID : EmergencyContactID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove contacts");
    };
    switch (contactsStore.get(contactID)) {
      case (null) { Runtime.trap("Contact not found") };
      case (?contact) {
        if (contact.owner != caller) {
          Runtime.trap("You do not own this contact");
        };
        contactsStore.remove(contactID);
      };
    };
  };

  public shared ({ caller }) func triggerSOS() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can trigger SOS");
    };
    let timestamp = Time.now();
    ignore sosTriggers.add(caller);

    let updatedProfile = switch (profiles.get(caller)) {
      case (null) {
        {
          user = caller;
          displayName = "";
          pinEnabled = false;
          pinHash = null;
          isSosActive = true;
          sosTimestamp = ?timestamp;
        };
      };
      case (?profile) {
        { profile with isSosActive = true; sosTimestamp = ?timestamp };
      };
    };

    profiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func cancelSOS() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel SOS");
    };
    ignore sosTriggers.remove(caller);

    let updatedProfile = switch (profiles.get(caller)) {
      case (null) {
        {
          user = caller;
          displayName = "";
          pinEnabled = false;
          pinHash = null;
          isSosActive = false;
          sosTimestamp = null;
        };
      };
      case (?profile) {
        { profile with isSosActive = false; sosTimestamp = null };
      };
    };

    profiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getCurrentSOSState() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query SOS state");
    };
    switch (profiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.isSosActive };
    };
  };

  public shared ({ caller }) func addEvidenceRecord(incidentType : Text, description : Text, notes : ?Text) : async EvidenceID {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add evidence records");
    };
    let id = nextEvidenceID;
    let record : EvidenceRecord = {
      id;
      incidentType;
      description;
      notes;
      timestamp = Time.now();
      owner = caller;
    };

    evidenceStore.add(id, record);
    nextEvidenceID += 1;
    id;
  };

  public query ({ caller }) func listUserEvidenceRecords() : async [EvidenceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list evidence records");
    };
    evidenceStore.values().toArray().filter(
      func(record) {
        record.owner == caller;
      }
    ).sort(EvidenceRecord.compareByTimestamp);
  };

  public shared ({ caller }) func deleteEvidenceRecord(evidenceID : EvidenceID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete evidence records");
    };
    switch (evidenceStore.get(evidenceID)) {
      case (null) { Runtime.trap("Evidence record not found") };
      case (?record) {
        if (record.owner != caller) {
          Runtime.trap("Unauthorized: Cannot delete evidence you did not create");
        };
        evidenceStore.remove(evidenceID);
      };
    };
  };

  public shared ({ caller }) func upsertSettings(updates : Updates) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update settings");
    };
    let currentProfile = {
      user = caller;
      isSosActive = false;
      sosTimestamp = null;
      displayName = updates.displayName;
      pinEnabled = updates.pinEnabled;
      pinHash = ?updates.pinHash;
    };
    profiles.add(caller, currentProfile);
  };

  public query ({ caller }) func getLegalArticle(articleID : LegalArticleID) : async LegalArticle {
    switch (articleStore.get(articleID)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) { article };
    };
  };

  public query ({ caller }) func getAllLegalArticles() : async [LegalArticle] {
    articleStore.values().toArray();
  };

  public shared ({ caller }) func addLegalArticle(title : Text, category : Text, content : Text) : async LegalArticleID {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add legal articles");
    };

    let id = nextArticleID;
    let article : LegalArticle = {
      id;
      title;
      category;
      content;
    };

    articleStore.add(id, article);
    nextArticleID += 1;
    id;
  };

  public shared ({ caller }) func seedDefaultLegalArticles() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin access required");
    };

    let defaultArticles = [
      {
        title = "Police FIR Process";
        category = "fir_process";
        content = "Step-by-step guidance on filing a First Information Report (FIR)...";
      },
      {
        title = "Women's Rights under Law";
        category = "womens_safety";
        content = "Overview of legal protections and safety measures for women...";
      },
      {
        title = "General Citizens Rights";
        category = "citizens_rights";
        content = "Explanation of fundamental rights and legal protections for citizens...";
      },
    ];

    for (article in defaultArticles.values()) {
      ignore addLegalArticle(article.title, article.category, article.content);
    };
  };
};
