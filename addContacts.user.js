// ==UserScript==
// @name         Add Contact API
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds bulk Add Contact for tickets in More dropdown
// @author       Gloria
// @grant        none
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Dashboard*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/TicketTabs*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Tasks*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/KnowledgeBase*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Wiki*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Search*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/WaterCooler*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Calendar*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/User*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Groups*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Customer*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Product*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Inventory*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Asset*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Report*
// @exclude      https://app.teamsupport.com/vcr/*/TicketPreview*
// @exclude      https://app.teamsupport.com/vcr/*/Images*
// @exclude      https://app.teamsupport.com/vcr/*/images*
// @exclude      https://app.teamsupport.com/vcr/*/Audio*
// @exclude      https://app.teamsupport.com/vcr/*/Css*
// @exclude      https://app.teamsupport.com/vcr/*/Js*
// @exclude      https://app.teamsupport.com/Services*
// @exclude      https://app.teamsupport.com/frontend*
// @exclude      https://app.teamsupport.com/Frames*
// @match        https://app.teamsupport.com/vcr/*


// ==/UserScript==

// constants
var url = "https://app.teamsupport.com/api/xml/";
var orgID = "";
var token = "";

// initialize XMLHttpRequest and DOMParser
var xhr = new XMLHttpRequest();
var parser = new DOMParser();

document.addEventListener('DOMContentLoaded', main(), false);

function createModal(){
    // create Resolved Versions modal pop up
    var modal = document.createElement("div");
    modal.className = "modal fade";
    modal.setAttribute("id", "addContactModal");
    modal.role = "dialog";
    modal.setAttribute("tabindex", -1);
    modal.setAttribute("aria-labelledby", "addContactModal");
    modal.setAttribute("aria-hidden", true);
    document.body.appendChild(modal);

    var modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog";
    modalDialog.setAttribute("role","document");
    modal.appendChild(modalDialog);

    var modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalDialog.appendChild(modalContent);

    //create modal header
    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalContent.appendChild(modalHeader);

    // create header title
    var header = document.createElement("h4");
    header.className = "modal-title";
    var hText = document.createTextNode("Add Contact");
    header.appendChild(hText);
    modalHeader.appendChild(header);

    // create header close button
    var hbutton = document.createElement("button");
    hbutton.setAttribute("type", "button");
    hbutton.className = "close";
    hbutton.setAttribute("data-dismiss", "modal");
    hbutton.setAttribute("aria-label", "Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden", true);
    span.innerHTML = "&times;";
    hbutton.appendChild(span);
    header.appendChild(hbutton);

    // create dropdown within modal body
    var modalBody = document.createElement("div");
    modalBody.className="modal-body";
    modalBody.id = "add-contact-body";
    modalContent.appendChild(modalBody);

    //create modal footer
    var modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";
    modalContent.appendChild(modalFooter);

    // create save and close buttons in modal footer
    var sbtn = document.createElement("button");
    var save = document.createTextNode("Add Contact");
    sbtn.appendChild(save);
    sbtn.id = "save-btn-contact";
    sbtn.type = "button";
    sbtn.setAttribute("data-dismiss", "modal");
    sbtn.className = "btn btn-primary";
    var cbtn = document.createElement("button");
    var close = document.createTextNode("Close");
    cbtn.appendChild(close);
    cbtn.type = "button";
    cbtn.className = "btn btn-secondary";
    cbtn.setAttribute("data-dismiss", "modal");
    modalFooter.appendChild(sbtn);
    modalFooter.appendChild(cbtn);
}

function main(){
    if(document.getElementsByClassName('btn-toolbar').length == 1){
        // create resolve version button in dropdown
        var ul = document.getElementsByClassName("dropdown-menu ticket-menu-actions")[0];
        ul.removeAttribute("aria-expanded");
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.appendChild(document.createTextNode("Add Contact"));
        a.setAttribute("class", "ticket-action-resolved");
        a.setAttribute("href", "#");
        a.setAttribute("data-toggle", "modal");
        a.setAttribute("data-target", "#addContactModal");
        li.appendChild(a);
        ul.appendChild(li);

        // create initial modal
        createModal();

        //if Add Contact mass button clicked, clear modal contents then replace modal contents appropriately
        a.addEventListener('click', function(e){
            console.log("ADD BUTTON CLICKED");
            e.preventDefault();
            var sel = document.getElementById('add-contact-body');
            if(sel) sel.innerHTML = "";
            addContact();
        });
    }
}

function addContact(){
    console.log("in addContent function");
    // get tickets that are selected and parse through the xml to add them to a ticket array
    var tickets = new Array();
    var elements = document.querySelectorAll('[class$="ticket-grid-cell-ticketnumber selected"]');

    var len = elements.length;
    for(var i=0; i<len; ++i){
        var ele = elements[i].innerHTML;
        var ticket = ele.substring(ele.indexOf(">")+1, ele.lastIndexOf("<"));
        tickets.push(ticket);
    }

    var modalBody = document.getElementById("add-contact-body");

    var custdropdown = document.createElement("div");
    custdropdown.className = "form-group";
    var custlabel = document.createElement("label");
    custlabel.setAttribute("for","acform-select-customer");
    custlabel.innerHTML = "Select a Customer";
    var custselect = document.createElement("select");
    custselect.className = "form-control";
    custselect.setAttribute("id", "acform-select-customer");

    custdropdown.appendChild(custlabel);
    custdropdown.appendChild(custselect);
    modalBody.appendChild(custdropdown);
    console.log("finished creating customer dropdown");

    var customers = getCustomers();
    for(var n=0; n<customers.name.length; ++n){
        var option = document.createElement("option");
        option.setAttribute("value", customers.id[n].innerHTML);
        option.innerHTML = customers.name[n].innerHTML;
        custselect.appendChild(option);
    }

    //create contact dropdown with options from API
    var contdropdown = document.createElement("div");
    contdropdown.className = "form-group";
    contdropdown.setAttribute("disabled", "true");
    var contlabel = document.createElement("label");
    contlabel.setAttribute("for","acform-select-contact");
    contlabel.innerHTML = "Select a Contact";
    var contselect = document.createElement("select");
    contselect.className = "form-control";
    contselect.setAttribute("id", "acform-select-contact");

    contdropdown.appendChild(contlabel);
    contdropdown.appendChild(contselect);
    modalBody.appendChild(contdropdown);
    console.log("created contact dropdown");

    //change contacts whenever customer changes
    document.getElementById('acform-select-customer').onchange = function create() {
        var customerID = document.getElementById('acform-select-customer').value;
        console.log(customerID);
        changeContacts(customerID);
    }

    // if Add Contact Save was clicked then send a post request
    document.getElementById('save-btn-contact').onclick = function saveVersion() {
        console.log("UPDATE CONTACTS ON TICKET...");
        updateContact(tickets);
    }
}

function changeContacts(customerID){
  console.log("changing contacts dropdown contents...");
  document.getElementById("acform-select-contact").innerHTML = "";
  if(customerID.length == 0) document.getElementById("acform-select-contact").innerHTML = "<option></option>";
  else {
    //get customer specific products from API
    var queryURL = url + "Customers/" + customerID + "/Contacts";
    console.log(queryURL);
    xhr.open("GET", queryURL, false, orgID, token);
    xhr.send();
    var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
    var id = xmlDoc.getElementsByTagName("ContactID");
    var firstName = xmlDoc.getElementsByTagName("FirstName");
    var lastName = xmlDoc.getElementsByTagName("LastName");

    //populate product dropdown
    var conDropDown = document.getElementById("acform-select-contact");
     for(var i=0; i<id.length; ++i){
       console.log(id[i]);
       var c = document.createElement("option");
       c.value = id[i].innerHTML;
       c.text = firstName[i].innerHTML + " " + lastName[i].innerHTML;
       conDropDown.options.add(c);
    }
  }
}

function getCustomers(){
  console.log("getting customers from api...");
  //get all the customers through the API
  var queryURL = url + "Customers";
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  var customerID = xmlDoc.getElementsByTagName("OrganizationID");
  var customerName = xmlDoc.getElementsByTagName("Name");

  return {
    id: customerID,
    name: customerName
  };
}

function getContacts(customerID){
    console.log("getting customers from api...");
    //get product versions and parse through xml tags
    var versions = new Array();
    var versionValues = new Array();
    var URL = url + "Customers/" + customerID + "/Contacts";
    xhr.open("GET", URL, false, orgID, token);
    xhr.send();
    var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
    var xmlVersionNames = xmlDoc.getElementsByTagName("VersionNumber");
    var xmlVersionID = xmlDoc.getElementsByTagName("ProductVersionID");

    return {
        name: xmlVersionNames,
        value: xmlVersionID
    };
}

async function updateContact(tickets){
    console.log("updating contacts...");
    var customer = document.getElementById('acform-select-customer');
    var customerValue = customer.value;
    var contact = document.getElementById('acform-select-contact');
    var contactValue = contact.value;
    var len = tickets.length;

    var data = '<Contact><ContactID>' + contactValue + '</ContactID></Contact>';

    var xmlData = parser.parseFromString(data,"text/xml");
    console.log(xmlData);

    // loop through the tickets array and update their contacts
    for(var t=0; t<len; ++t){
        console.log(tickets[t]);
        var putURL = url + "tickets/" + tickets[t] + '/Contacts/' + contactValue;
        xhr.open("POST", putURL, false, orgID, token);
        xhr.send(xmlData);
    }

    //force reload so website reflects resolved version change
    location.reload();
}
