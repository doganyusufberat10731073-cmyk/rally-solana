export const IDL = {
  "address": "DkzLzgXKWj6yXkBYbEJEfP9ZSeQgcJjYs2e4hGueEPaW",
  "metadata": {
    "name": "rally",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancel_activity",
      "discriminator": [
        37,
        142,
        43,
        46,
        185,
        106,
        210,
        244
      ],
      "accounts": [
        {
          "name": "activity",
          "writable": true
        },
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "activity"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "complete_activity",
      "discriminator": [
        251,
        178,
        213,
        89,
        77,
        185,
        211,
        154
      ],
      "accounts": [
        {
          "name": "activity",
          "writable": true
        },
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "activity"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "create_activity",
      "discriminator": [
        185,
        108,
        147,
        27,
        45,
        183,
        236,
        153
      ],
      "accounts": [
        {
          "name": "activity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  116,
                  105,
                  118,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "activity_id"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "activity_id",
          "type": "u64"
        },
        {
          "name": "max_participants",
          "type": "u16"
        }
      ]
    },
    {
      "name": "join_activity",
      "discriminator": [
        189,
        137,
        247,
        106,
        85,
        72,
        45,
        127
      ],
      "accounts": [
        {
          "name": "participant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "activity"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "activity",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "leave_activity",
      "discriminator": [
        26,
        40,
        68,
        215,
        6,
        26,
        108,
        125
      ],
      "accounts": [
        {
          "name": "participant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "activity"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "activity",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Activity",
      "discriminator": [
        159,
        236,
        145,
        113,
        221,
        192,
        137,
        112
      ]
    },
    {
      "name": "Participant",
      "discriminator": [
        32,
        142,
        108,
        79,
        247,
        179,
        54,
        6
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidMaxParticipants",
      "msg": "Max participants must be greater than 0."
    },
    {
      "code": 6001,
      "name": "ActivityNotOpen",
      "msg": "Activity is not open."
    },
    {
      "code": 6002,
      "name": "ActivityFull",
      "msg": "Activity is full."
    },
    {
      "code": 6003,
      "name": "CreatorCannotLeave",
      "msg": "Creator cannot leave the activity. Cancel it instead."
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6005,
      "name": "ActivityAlreadyCancelled",
      "msg": "Activity is already cancelled."
    }
  ],
  "types": [
    {
      "name": "Activity",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "activity_id",
            "type": "u64"
          },
          {
            "name": "max_participants",
            "type": "u16"
          },
          {
            "name": "participant_count",
            "type": "u16"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "ActivityStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ActivityStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Full"
          },
          {
            "name": "Completed"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    },
    {
      "name": "Participant",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "activity",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
} as const;

export type Rally = typeof IDL;
