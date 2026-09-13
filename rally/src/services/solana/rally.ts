export type Rally = {
  "version": "0.1.0",
  "name": "rally",
  "instructions": [
    {
      "name": "createActivity",
      "accounts": [
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "activityId", "type": "u64" },
        { "name": "maxParticipants", "type": "u16" }
      ]
    },
    {
      "name": "joinActivity",
      "accounts": [
        { "name": "participant", "isMut": true, "isSigner": false },
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "leaveActivity",
      "accounts": [
        { "name": "participant", "isMut": true, "isSigner": false },
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "cancelActivity",
      "accounts": [
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": false, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "completeActivity",
      "accounts": [
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": false, "isSigner": true }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "activity",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "creator", "type": "publicKey" },
          { "name": "activityId", "type": "u64" },
          { "name": "maxParticipants", "type": "u16" },
          { "name": "participantCount", "type": "u16" },
          { "name": "status", "type": { "defined": "ActivityStatus" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "participant",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "publicKey" },
          { "name": "activity", "type": "publicKey" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ActivityStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "open" },
          { "name": "full" },
          { "name": "completed" },
          { "name": "cancelled" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvalidMaxParticipants", "msg": "Max participants must be greater than 0." },
    { "code": 6001, "name": "ActivityNotOpen", "msg": "Activity is not open." },
    { "code": 6002, "name": "ActivityFull", "msg": "Activity is full." },
    { "code": 6003, "name": "CreatorCannotLeave", "msg": "Creator cannot leave the activity. Cancel it instead." },
    { "code": 6004, "name": "Unauthorized", "msg": "You are not authorized to perform this action." },
    { "code": 6005, "name": "ActivityAlreadyCancelled", "msg": "Activity is already cancelled." }
  ]
};

export const IDL: Rally = {
  "version": "0.1.0",
  "name": "rally",
  "instructions": [
    {
      "name": "createActivity",
      "accounts": [
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "activityId", "type": "u64" },
        { "name": "maxParticipants", "type": "u16" }
      ]
    },
    {
      "name": "joinActivity",
      "accounts": [
        { "name": "participant", "isMut": true, "isSigner": false },
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "leaveActivity",
      "accounts": [
        { "name": "participant", "isMut": true, "isSigner": false },
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "cancelActivity",
      "accounts": [
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": false, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "completeActivity",
      "accounts": [
        { "name": "activity", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": false, "isSigner": true }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "activity",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "creator", "type": "publicKey" },
          { "name": "activityId", "type": "u64" },
          { "name": "maxParticipants", "type": "u16" },
          { "name": "participantCount", "type": "u16" },
          { "name": "status", "type": { "defined": "ActivityStatus" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "participant",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "publicKey" },
          { "name": "activity", "type": "publicKey" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ActivityStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "open" },
          { "name": "full" },
          { "name": "completed" },
          { "name": "cancelled" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvalidMaxParticipants", "msg": "Max participants must be greater than 0." },
    { "code": 6001, "name": "ActivityNotOpen", "msg": "Activity is not open." },
    { "code": 6002, "name": "ActivityFull", "msg": "Activity is full." },
    { "code": 6003, "name": "CreatorCannotLeave", "msg": "Creator cannot leave the activity. Cancel it instead." },
    { "code": 6004, "name": "Unauthorized", "msg": "You are not authorized to perform this action." },
    { "code": 6005, "name": "ActivityAlreadyCancelled", "msg": "Activity is already cancelled." }
  ]
};
