//#region Global variables, initializations and functions go here!
let balance = 0;
let currentLoan = 0;
let cash = 0;
let bankBalanceTag = document.getElementById("bankBalanceTag");
let currentLoanTag = document.getElementById("currentLoanTag");
let cashTag = document.getElementById("cashTag");
let computer;

let select = document.getElementById("laptopSelect");
const url = "https://noroff-komputer-store-api.herokuapp.com/computers";

// A small function for updating the balance tag. Clears what was previously there, and writes the new.
function updateBankBalanceTag(balance) {
    bankBalanceTag.innerHTML = "";
    bankBalanceTag.innerText = "Balance: DKK " + parseFloat(balance);
}
function updateCurrentLoanTag(currentLoan) {
    // A quick check to see if we have a loan. If we don't, we set the visibility of the tag to hidden,
    // otherwise, we show it, and update the the content to be relevant.
    if (currentLoan == 0) {
        currentLoanTag.style.visibility = "hidden";
        document.getElementById("allTowardsLoanButton").style.visibility = "hidden";
    } else {
        currentLoanTag.style.visibility = "visible";
        currentLoanTag.innerText = "";
        currentLoanTag.innerText = "Current Loan: DKK " + parseFloat(currentLoan);
    }
}

function updateCashTag(cash) {
    // Again, starting out by clearing all inner text.
    cashTag.innerText = "";
    // Not entirely sure I need to parse here, as cash will be displayed as a string, but better safe than sorry.
    cashTag.innerText = "Cash in hand: DKK " + cash;
}

updateBankBalanceTag(balance);
updateCurrentLoanTag(currentLoan);
updateCashTag(cash);


//#endregion

//#region All of (well, most of) the bank associated code, goes here


function getLoanButtonClick(currentBalance) {
    // Define the maximum loan size
    let maxLoan = currentBalance * 2;
    // Check if an outstanding loan exists and if it does, reject loan application.
    if (currentLoan > 0) {
        alert("You have to pay of your current loan (" + currentLoan + " DKK), before taking out a new loan.");
    } else {
        // Reject loan if user is trying with 0 DKK in their account.
        if (balance === 0) {
            alert("Sorry, you do need to have some funds, before we are able to offer you a loan.");
        } else {
            // Prompt the user, for how big a loan they would like, displaying the maximum amount they're able to loan.
            let desiredLoan = prompt("You are currently able to take out a loan of " + maxLoan + " DKK. How much would you like to loan?");
            // Check if user input a number or some random text.
            if (isNaN(desiredLoan)) {
                alert("You have to enter a number silly. We don't lend out words here.");
                // Check if user tries to take out a larger loan than is allowed.
            } else if (desiredLoan > maxLoan) {
                alert("Sorry, but you were clearly informed that you could take out a max loan of " + maxLoan + " DKK. Please revise your loan application.");
                // Finally granting the loan, and declaring the terms of the loan (after the loan is taken out, like a good bank would).
            } else {
                alert("Congratulations, we have granted you a loan of " + desiredLoan + " DKK. Please note, that we will be deducting 10% of your future deposits, until your loan is repayed.");
                // We set our global loanamount, to the loan that has just been taken out.
                currentLoan = desiredLoan;
                // When adding to the balance, I have to parse the number, otherwise it just concat's the two.
                balance += parseFloat(desiredLoan);
                updateBankBalanceTag(parseFloat(balance));
                updateCurrentLoanTag(currentLoan);
                // If we have a loan, make a new button appear
                document.getElementById("allTowardsLoanButton").style.visibility = "visible";
            }
        }
    }

}

//#endregion

//#region All of the work related code goes here. Again, there will be some crossover with the bank code, but trying to keep it as seperate as possible.

// Make that paper!
function workButtonClick() {
    // Again, parsing the number added, as float, to ensure it does just concat
    cash += parseFloat(100);
    // Calling the update function, to make sure the tag represents the actual value.
    updateCashTag(cash);
}

function depositCashButtonClick(money) {
    // Checking if the user has an outstanding loan
    if (currentLoan > 0) {
        // Then we calculate the 10% of the cash, that must be paid as interest.
        let loanInterest = parseFloat(money * 0.1);
        // Testing if the loan interest is bigger than the current remaining loan.
        // If it is, we shouldn't take all of it.
        if (loanInterest >= currentLoan) {
            let remainder = currentLoan - loanInterest;
            if (remainder === 0) {
                balance += parseFloat(money - currentLoan);
                currentLoan = 0;
            }
            // Settiing our cash back to 0 and updating the labels.
            cash = 0;
            updateBankBalanceTag(balance);
            updateCashTag(cash);
            updateCurrentLoanTag(currentLoan);
            // If the interest is not higher than the remainder of the loan, then we just deduct the interest.
        } else {
            currentLoan -= parseFloat(loanInterest);
            balance += parseFloat(cash - loanInterest);
            // Again, setting the cash back to 0, and updating the various tags.
            cash = 0;
            updateBankBalanceTag(balance);
            updateCashTag(cash);
            updateCurrentLoanTag(currentLoan);
        }
        // And if we have no loan, we just deposit the money to the users account.
    } else {
        balance += parseFloat(money);
        cash = 0;
        updateBankBalanceTag(balance);
        updateCashTag(cash);
    }
}

function allTowardsLoanButtonClick(money) {
    if (currentLoan > money) {
        currentLoan -= parseFloat(money);
        updateCurrentLoanTag(currentLoan);
        cash = 0;
        updateCashTag(cash);
    } else {
        cash -= currentLoan;
        currentLoan = 0;
        updateCurrentLoanTag(currentLoan);
        updateCashTag(cash);
    }
}

//#endregion

//#region All of the code in this region is for the laptop section of the store. That being both the dropdown and the display area.


// Calling the API to get access to the different laptops. I tried my darndest, to put this in a local array
// But I couldn't get it to work. However, this first function is reserved for getting the laptops, and passing each
// laptop, to the function that populates our dropdown.
async function getLaptops() {
    // As I use the URL multiple times, I declared it at the beginning. We then fetch the URL. Seeing as the
    // endpoint doesn't take any specific arguments, we can just use fetch.
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // After getting the data from the API and reading it in as JSON, we loop through and send each
            // to the populateLaptopDropdown function;
            for (dat of data) {
                populateLaptopDropdown(dat);
            }
        });
}
// The function used to put the laptops into the dropdown on the frontend.
function populateLaptopDropdown(laptop) {
    // Creating a new option for select foreach of the laptops and attaching the to the select (Dropdown)
    let option = document.createElement('option');
    option.value = laptop.id;
    option.text = laptop.title;
    select.appendChild(option);
}
// Function that renders the specs of the laptop to the user. We pass in laptop as the param and this is retrieved 
// in the getSelectedLaptop function.
function displayLaptopSpecs(laptop) {
    // Specs is an array in the laptop object, and as such we have to loop through it
    let specs = laptop.specs;
    let specList = document.getElementById("specsList");
    // We clear the inner HTML of the specsList ul, before looping through our specs.
    specsList.innerHTML = "";
    // We loop through the specs array, to get the specs for the selected machine.
    for (spec of specs) {
        // Because there is a different amount of specs to each laptop, we have to dynamically add li to our ul.
        // We then set the innerText of the li to the spec, thus rendering it, and finally we append it to the ul.
        let item = document.createElement("li");
        item.innerText = spec;
        specList.appendChild(item);
    }
}
// This function renders the image of the laptop, to the appropriate area on the frontend. We pass in the selected laptop as
// our param again, which again is retrieved in a different function.
function displayLaptopImage(laptop) {
    // We start by checking if the img field exists already, and if it doesn't we create it. As we create it, we also
    // set the id, which is what we use to check if it even exists. We then set our attributes and src.
    if (document.getElementById("laptopImage") === null) {
        let img = document.createElement("img");
        img.setAttribute("height", "300px");
        img.setAttribute("width", "300px");
        img.id = "laptopImage";
        img.src = laptop.image;
        document.getElementById("productImageDisplay").appendChild(img);
    } else {
        // And if it exists, we just reassign the source for the image.
        document.getElementById("laptopImage").src = laptop.image;
    }
}

// Same basic idea as the others. We pass in the laptop if the we have an id on the page, and if we don't
// we create all the needed elements.
function displayLaptopDescription(laptop) {
    let productDescription = document.getElementById("productDescription");
    if (document.getElementById("laptopTitle") === null) {
        let laptopTitle = document.createElement("h1");
        let laptopDescription = document.createElement("div");
        laptopTitle.id = "laptopTitle";
        laptopDescription.id = "laptopDescription";
        laptopTitle.innerText = laptop.title;
        laptopDescription.innerText = laptop.description;
        productDescription.appendChild(laptopTitle);
        productDescription.appendChild(laptopDescription);
    } else {
        document.getElementById("laptopTitle").innerText = laptop.title;
        document.getElementById("laptopDescription").innerText = laptop.description;
    }
}

function displayLaptopPrice(laptop) {
    let priceTitle = document.getElementById("laptopPriceTag");
    priceTitle.innerText = "DKK " + laptop.price;
}

// Here we pass in the ID of the laptop we wish to view. The ID is retrieved in a seperate function.
async function getSelectedLaptop(id) {
    // Again, we fetch from the API, but this time we append the ID to the url, to get the specific laptop
    fetch(url + "/" + id)
        // We get the response, turn it into a json object and then pass that as data, to our 4 render functions.
        .then(response => response.json())
        .then(data => {
            displayLaptopSpecs(data);
            displayLaptopImage(data);
            displayLaptopDescription(data);
            displayLaptopPrice(data);
            computer = data;
        });

}

// This is the onchange function for the select (dropdown). All we do here is get the ID of the selected laptop
// and then we call getSelectedLaptop and pass the id of the selected item.
function getProductInfo() {
    let laptopSelect = document.getElementById("laptopSelect");
    let laptopId = laptopSelect.value;
    getSelectedLaptop(laptopId);
}
// The function for buying the computer, and the hurray message delivered when successful or the wahwah message if you can't afford it.
function buyLaptopButtonClick(laptop) {
    console.log(laptop.title, laptop.price);
    if (balance >= laptop.price) {
        balance -= parseFloat(laptop.price);
        updateBankBalanceTag(balance);
        alert("Congratulations. You are now the proud owner of a brand spanking new " + laptop.title +
            ". Please enjoy and feel free to come back any time.");
    } else {
        alert("Sorry, it looks like you're about DKK " + (laptop.price - balance) + " short. Go do some work, and come back, when you're serious about purchasing.");
    }
}

// Finally here, we call the 2 setup functions.
getLaptops();
// This is called to render the information of the initially selected laptop on screen.
getSelectedLaptop(1);

//#endregion