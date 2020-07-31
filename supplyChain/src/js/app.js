
App = {
  web3Provider: null,
  contracts: {},
  registered:[],
  addr:'',
  
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
    }
    web3 = new Web3(App.web3Provider);
    App.populateAddress();
    return App.initContract();
  },
  initContract: function() {
    $.getJSON('supplyChain.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var contractArtifact = data;
    App.contracts.supplyChain = TruffleContract(contractArtifact);

    // Set the provider for our contract
    App.contracts.supplyChain.setProvider(App.web3Provider);
    
    return App.bindEvents();
    });
  },
  populateAddress: function(){
      new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545')).eth.getAccounts((err, accounts) => {
        var txt = "";
          for(var i=0;i<accounts.length;i++){
              txt += "<option value='" + accounts[i] + "'>"+accounts[i]+"</option>";
          }
          $('#address').html(txt);
          $('#user_address').html(txt);
    });
  },
  bindEvents: function(){
    $(document).ready(function(){
        $("#address").on('change', function(){
            new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545')).eth.getAccounts((err, accounts) => {
            console.log($('#address').val());
            });
        });
    });
    $(document).ready(function(){
        $("#user_address").on('change', function(){
            console.log($('#user_address').val());
            window.localStorage.setItem('selected_addr',JSON.stringify($('#user_address').val()));
            App.addr = $('#user_address').val();
            console.log(App.addr);
        });
    });
      //Works fine!(but was not working when account switched in metamask before.but today it's working)
    $(document).ready(function(){
        $('.button-start').on('click', function(event){
	        ethereum.enable();
            var msg;
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.register({from:$('#address').val()});
            }).then(function(res){
                    if(res.receipt.status == '0x01'){
                        msg = "registration succesful! Your ID is ";
		              }
                    else{
                        msg = "registration failed";
                    }
                    return contractInstance.temp_id.call({from:$('#address').val()});
            }).then(function(result){
            if(msg == "registration succesful! Your ID is "){
                $(".container-receipt-start").text(msg+result);
            }
            else{
                $(".container-receipt-start").text(msg);}
            });
        });
    });
    
    //works fine!
    $(document).ready(function(){
        $('.button-addItem').on('click', function(event){
            var contractInstance;
            var hex;
            var convertedByte = "0x";
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            //var str = $("#itemDescription").val();
            for(var i=0;i<$("#itemDescription").val().length;i++) {
                hex = $("#itemDescription").val().charCodeAt(i).toString(16);
                convertedByte += hex;
            }
            if((convertedByte.length)<66){
                while (convertedByte.length!=66) {
                    convertedByte += '0';
                }
            }
            var price = (parseFloat($("#price").val(),10))*(10**(18));
            //var _price = $("#price").val();
            //var _inventory = $("#inventory").val();
            return contractInstance.addItem(convertedByte, price, $("#inventory").val(), {from:App.addr});
            }).then(function(res){
                return contractInstance.temp_id.call({from:App.addr});
            }).then(function(result){
            $(".container-receipt-addItem").text("Your product's ID is "+result);
            }).catch( function(err){
             $(".container-receipt-addItem").text("Please register first.");
            });
        });
    });
      
    $(document).ready(function(){
        $('.button-updateItem').on('click', function(event){
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            var p=$('#newPrice').val();
            if(p==""){
                p=0;
            }
            return contractInstance.updateItem($("#updateItemId").val(), p, $("#newInventory").val(), {from:App.addr});
            }).then(function(res){
                if(res.receipt.status == '0x01'){
                    alert("Successfully updated!");
		        }
                else{
                    alert("Update failed.");
                }
            });
        });
    });
        
    //works fine!
    $(document).ready(function(){
        $('.button-viewOrders').on('click', function(event){
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.viewOrderList.call({from:App.addr});
            }).then(function(result){
            var txt = "<table border=1><tr><th>ItemID</th><th>Buyer details</th><th>Order size</th><th>Order status</th></tr>";
            for(var i=0;i<result[1].length-1;i++){
                for(var j=0; j<result[1].length-1;j++){
                    if(result[1][j]<result[1][j+1]){
                        for(var k=0;k<result.length;k++){
                            var temp=result[k][j];
                            result[k][j]=result[k][j+1];
                            result[k][j+1]=temp;
                        }
                    }
                }
            }
            var status = [];
            for (var l=0;l<result[3].length;l++){
                if(result[3][l]==true){
                    status.push("Done");
                }else{
                    status.push("Remaining");
                }
            }
            for(var m=0;m<result[0].length;m++){
                txt += "<tr><td>"+result[1][m]+"</td><td>"+result[0][m]+"</td><td>"+result[2][m]+"</td><td>"+status[m]+"</td></tr>";
            }
            txt += "</table>";
            $('#container-orderTable').html(txt);
            }).catch( function(err){
            alert("Please register first.")
            });
        });
    });
    
  }
};
$(function() {
    $(window).load(function() {
        App.init();
        console.log('starting app.js');
    });
});

