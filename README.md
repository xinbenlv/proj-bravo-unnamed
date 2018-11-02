A system for the zgthx
This replaces 

## Usual Journey
1. Create an activity (meeting, event, worktask, etc)
2. Me too - I am also in the activity.
  (wait, who has the right to do so?)
3. Like: when there are enough likes, it gets approved.
4. Check balance 

## Data Structure

### `Accounts`
 - `accountId`
 - `name`

### `Transactions` Table: for all transactions
 - `transactionId`
 - `timestamp`
 - `sender`: this could be the system as well 
 - `receiver`
 - `amount`
 - `note`

Method: `addTransaction(sender, receiver, note)`
 

### `Recognitions` Table: for each zgThx award record
 - `nominationId`
 - `nominator`
 - `receiver`
 - `type`
 - `amount`
 - `approvalId`

### `Approvals` Table: for each 
 - `id`
 - `nominationId`

### `Likes` Table:
 - `liker`
 - `nominationId` - only one required
 
 
