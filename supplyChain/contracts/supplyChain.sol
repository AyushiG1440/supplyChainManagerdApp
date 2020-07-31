pragma solidity 0.4.18;

//0.4.18 gives error in require, try to get 0.4.24 compiler in truffle

contract supplyChain{
    struct order{
        uint orderID;
        address buyer;
        uint itemId;
        uint quantity;
        bool doneStatus;
    }
    struct person{
        uint ID;
        order[] sellOrders;
        order[] placedOrders;
        bool registered;
    }
    struct item{
        uint itemID;
        bytes32 itemDescription;
        address producer;
        uint price;
        uint inventory;
    }
    
    item[] itemList;
    uint personCount = 1;
    uint itemCount = 0;
    uint orderCount = 1;
    mapping (address => person) personDetails;
    uint public temp_id;
    
    function register() public {
        if(personDetails[msg.sender].registered==true){
            temp_id = personDetails[msg.sender].ID;
        }
         else{
             personDetails[msg.sender].ID = personCount;
             personCount++;
             personDetails[msg.sender].registered=true;
            temp_id = personDetails[msg.sender].ID;
         }
    }
    
    modifier onlyRegistered () {
      require(personDetails[msg.sender].registered == true);
      _;
    }
    
    function addItem(bytes32 _itemDescription,uint _price,uint _inventory) public onlyRegistered{
        itemList.push(item({itemID:itemCount,itemDescription:_itemDescription,producer:msg.sender,price:_price,inventory:_inventory}));
        itemCount++;
        temp_id = itemCount-1;
    }
    function updateItem(uint _itemID,uint _price,uint _inventory) public onlyRegistered{
        itemList[_itemID].inventory += _inventory;
        if(_price!=0){
            itemList[_itemID].price = _price;
        }
    }
    
    function getItems() public view returns(uint[],bytes32[],uint[],uint[]){
        uint[] memory a = new uint[](itemList.length);
        bytes32[] memory b = new bytes32[](itemList.length);
        uint[] memory c = new uint[](itemList.length);
        uint[] memory d = new uint[](itemList.length);
        for (uint i = 0; i < itemList.length; i++)
            {
                a[i] = itemList[i].itemID;
                b[i] = itemList[i].itemDescription;
                c[i] = itemList[i].price;
                d[i] = itemList[i].inventory;
            }
        return (a,b,c,d);
    }
    
    function placeOrder(uint _itemID,uint _quantity) public payable {
        //0.5 extra for safety escrow
        require(msg.value  == (_quantity*itemList[_itemID].price)+500000000000000000);
        require(_quantity<=itemList[_itemID].inventory);
        address seller = itemList[_itemID].producer;
        personDetails[seller].sellOrders.push(order({orderID:orderCount,buyer:msg.sender,itemId:_itemID,quantity:_quantity,doneStatus:false}));
        personDetails[msg.sender].placedOrders.push(order({orderID:orderCount,buyer:msg.sender,itemId:_itemID,quantity:_quantity,doneStatus:false}));
        orderCount++;
        itemList[_itemID].inventory -=_quantity;
        temp_id = orderCount-1;
    } 
    
    function viewPlacedOrders() public view returns(uint[],uint[],uint[],bool[]){
        uint[] memory a = new uint[](personDetails[msg.sender].placedOrders.length);
        uint[] memory b = new uint[](personDetails[msg.sender].placedOrders.length);
        uint[] memory c = new uint[](personDetails[msg.sender].placedOrders.length);
        bool[] memory d = new bool[](personDetails[msg.sender].placedOrders.length);
        for (uint i = 0; i < personDetails[msg.sender].placedOrders.length; i++)
            {
                a[i] = personDetails[msg.sender].placedOrders[i].orderID;
                b[i] = personDetails[msg.sender].placedOrders[i].itemId;
                c[i] = personDetails[msg.sender].placedOrders[i].quantity;
                d[i] = personDetails[msg.sender].placedOrders[i].doneStatus;
            }
         return (a,b,c,d);
    }
    
    function viewOrderList() public view onlyRegistered returns(address[],uint[],uint[],bool[]){
        address[] memory a = new address[](personDetails[msg.sender].sellOrders.length);
        uint[] memory b = new uint[](personDetails[msg.sender].sellOrders.length);
        uint[] memory c = new uint[](personDetails[msg.sender].sellOrders.length);
        bool[] memory d = new bool[](personDetails[msg.sender].sellOrders.length);
        for (uint i = 0; i < personDetails[msg.sender].sellOrders.length; i++)
            {
                a[i] = personDetails[msg.sender].sellOrders[i].buyer;
                b[i] = personDetails[msg.sender].sellOrders[i].itemId;
                c[i] = personDetails[msg.sender].sellOrders[i].quantity;
                d[i] = personDetails[msg.sender].sellOrders[i].doneStatus;
            }
        return (a,b,c,d);
    }
    
    function confirmReceive(uint _itemID,uint _orderID) public{
        address addr = itemList[_itemID].producer;
        for(uint i=0;i<personDetails[addr].sellOrders.length;i++){
            if(personDetails[addr].sellOrders[i].buyer==msg.sender && personDetails[addr].sellOrders[i].orderID == _orderID && personDetails[addr].sellOrders[i].doneStatus == false){
                personDetails[addr].sellOrders[i].doneStatus = true;
                addr.transfer((personDetails[addr].sellOrders[i].quantity)*(itemList[_itemID].price));
                msg.sender.transfer(500000000000000000);
            }
        }
        for(uint j=0;j<personDetails[msg.sender].placedOrders.length;j++){
            if(personDetails[msg.sender].placedOrders[j].buyer==msg.sender && personDetails[msg.sender].placedOrders[j].orderID == _orderID && personDetails[msg.sender].placedOrders[j].doneStatus == false){
                personDetails[msg.sender].placedOrders[j].doneStatus = true;
            }
        }
    }
}
