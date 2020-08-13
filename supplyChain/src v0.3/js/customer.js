var index;
function setIndex(a){
index = a;
console.log("clicked");
var obj1 = $(".row-id").eq(index).text();
var obj2 = $(".row-description").eq(index).text();
var obj3 = $(".row-price").eq(index).text();
var obj4 = $(".row-inventory").eq(index).text();
console.log(obj1);
console.log(obj2);
console.log(obj3);
console.log(obj4);
window.localStorage.setItem("id",JSON.stringify(obj1));
window.localStorage.setItem("description",JSON.stringify(obj2));
window.localStorage.setItem("price",JSON.stringify(obj3));
window.localStorage.setItem("inventory",JSON.stringify(obj4));
}

function myFunction() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}
App = {
  web3Provider: null,
  contracts: {},
  addr:'',
  name:'',
  
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
  
  bindEvents: function(){
  $(document).ready(function(){
            App.addr = JSON.parse(window.localStorage.getItem('selected_addr'));
            App.name = JSON.parse(window.localStorage.getItem('selected_name'));
            $(".dropbtn").text("Welcome, "+App.name);
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.getItems.call();
            }).then(function(result){
            var txt = "<table id='myTable'><tr><th>Item ID</th><th>Item Description</th><th>Price per piece(ether)</th><th>Inventory</th><th></th></tr>";
            var t_price;
            var prices = [];
            var str = [];
            for (var j=0;j<result[1].length;j++){
                var t_str = '';
                var hex = result[1][j].toString();
                for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2){
                    t_str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                }
                str.push(t_str);
                t_price=(parseFloat(result[2][j],10))*(10**(-18));
                prices.push(t_price);
            }
            for(var k=0;k<result[0].length;k++){
            txt += "<tr><td class='row-id'>"+result[0][k]+"</td><td class='row-description'>"+str[k]+"</td><td class='row-price'>"+prices[k]+"</td><td class='row-inventory'>"+result[3][k]+"</td><td><a href='item.html'><button class='button-select' onclick='setIndex("+k+")'>Buy Now!</button></a></td></tr>";
            }
            txt += "</table>";
            $("#container-itemTable").html(txt);
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
