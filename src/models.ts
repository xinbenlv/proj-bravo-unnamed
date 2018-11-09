interface Account {
  id:string;
}

interface Transaction {
  id:string;
  timestamp:Date;
  sender:string;
  receiver:string;
  amount:number;
  note:string;
}

interface Bravo {
  id:string;
  giver:string;
  receivers:Set<string>;
  type:string;
  amountEach:number;
  approvalId:string;
  likers: Set<string>;
  isApproved:boolean;
}