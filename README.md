# A system for the zgthx

## Version 1 (current)
Using the AirTable as backend to build the zgThx

### Features
- [X] show points of individual users
- [X] show how points was gained by individual users
- [X] invalidate cache after certain time
  - is it needed? or Heroku will help us do that?
  - yes, it is needed
- [X] show points of top 10 point-leader
- [X] submit in peer bonus
- [X] show latest peer bonus

## Version 2 (next)
- Data in Database
- Support API sending points and receiving points


### User Journey
1. Create an activity (meeting, event, worktask, etc)
2. Me too - I am also in the activity.
  (wait, who has the right to do so?)
3. Like: when there are enough likes, it gets approved.
4. Check balance 

### Data Structure

#### `Account`
 - `accountId`
 - `name`

#### `Transaction` Table: for all transactions
 - `transactionId`
 - `timestamp`
 - `sender`: this could be the system as well 
 - `receiver`
 - `amount`
 - `note`

Method: `addTransaction(sender, receiver, note)`

#### `Recognition` Table: for each zgThx award record
 - `nominationId`
 - `nominator`
 - `receiver`
 - `type`
 - `amount`
 - `approvalId`

#### `Approval` Table: for each 
 - `id`
 - `nominationId`

#### `Like` Table:
 - `liker`
 - `nominationId` - only one required
 
 
