use anchor_lang::prelude::*;

declare_id!("DkzLzgXKWj6yXkBYbEJEfP9ZSeQgcJjYs2e4hGueEPaW");

#[program]
pub mod rally {
    use super::*;

    pub fn create_activity(
        ctx: Context<CreateActivity>,
        activity_id: u64,
        max_participants: u16,
    ) -> Result<()> {
        require!(max_participants > 0, ErrorCode::InvalidMaxParticipants);

        let activity = &mut ctx.accounts.activity;
        activity.creator = ctx.accounts.creator.key();
        activity.activity_id = activity_id;
        activity.max_participants = max_participants;
        activity.participant_count = 0;
        activity.status = ActivityStatus::Open;
        activity.bump = ctx.bumps.activity;

        Ok(())
    }

    pub fn join_activity(ctx: Context<JoinActivity>) -> Result<()> {
        let activity = &mut ctx.accounts.activity;
        
        require!(activity.status == ActivityStatus::Open, ErrorCode::ActivityNotOpen);
        require!(activity.participant_count < activity.max_participants, ErrorCode::ActivityFull);

        let participant = &mut ctx.accounts.participant;
        participant.user = ctx.accounts.user.key();
        participant.activity = activity.key();
        participant.bump = ctx.bumps.participant;

        activity.participant_count = activity.participant_count.checked_add(1).unwrap();

        if activity.participant_count == activity.max_participants {
            activity.status = ActivityStatus::Full;
        }

        Ok(())
    }

    pub fn leave_activity(ctx: Context<LeaveActivity>) -> Result<()> {
        let activity = &mut ctx.accounts.activity;
        require!(activity.creator != ctx.accounts.user.key(), ErrorCode::CreatorCannotLeave);

        activity.participant_count = activity.participant_count.checked_sub(1).unwrap();
        
        if activity.status == ActivityStatus::Full && activity.participant_count < activity.max_participants {
            activity.status = ActivityStatus::Open;
        }

        Ok(())
    }

    pub fn cancel_activity(ctx: Context<CancelActivity>) -> Result<()> {
        let activity = &mut ctx.accounts.activity;
        activity.status = ActivityStatus::Cancelled;
        Ok(())
    }

    pub fn complete_activity(ctx: Context<CompleteActivity>) -> Result<()> {
        let activity = &mut ctx.accounts.activity;
        require!(activity.status != ActivityStatus::Cancelled, ErrorCode::ActivityAlreadyCancelled);
        activity.status = ActivityStatus::Completed;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(activity_id: u64)]
pub struct CreateActivity<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 8 + 2 + 2 + 1 + 1,
        seeds = [b"activity", creator.key().as_ref(), &activity_id.to_le_bytes()],
        bump
    )]
    pub activity: Account<'info, Activity>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinActivity<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 1,
        seeds = [b"participant", activity.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub participant: Account<'info, Participant>,
    
    #[account(mut)]
    pub activity: Account<'info, Activity>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LeaveActivity<'info> {
    #[account(
        mut,
        close = user,
        seeds = [b"participant", activity.key().as_ref(), user.key().as_ref()],
        bump = participant.bump
    )]
    pub participant: Account<'info, Participant>,
    
    #[account(mut)]
    pub activity: Account<'info, Activity>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelActivity<'info> {
    #[account(
        mut,
        has_one = creator @ ErrorCode::Unauthorized
    )]
    pub activity: Account<'info, Activity>,
    
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteActivity<'info> {
    #[account(
        mut,
        has_one = creator @ ErrorCode::Unauthorized
    )]
    pub activity: Account<'info, Activity>,
    
    pub creator: Signer<'info>,
}

#[account]
pub struct Activity {
    pub creator: Pubkey,
    pub activity_id: u64,
    pub max_participants: u16,
    pub participant_count: u16,
    pub status: ActivityStatus,
    pub bump: u8,
}

#[account]
pub struct Participant {
    pub user: Pubkey,
    pub activity: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ActivityStatus {
    Open,
    Full,
    Completed,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Max participants must be greater than 0.")]
    InvalidMaxParticipants,
    #[msg("Activity is not open.")]
    ActivityNotOpen,
    #[msg("Activity is full.")]
    ActivityFull,
    #[msg("Creator cannot leave the activity. Cancel it instead.")]
    CreatorCannotLeave,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Activity is already cancelled.")]
    ActivityAlreadyCancelled,
}
