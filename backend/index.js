// const puppeteer = require("puppeteer");
const fs = require("fs");
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());


async function scrapeJobListings(searchQuery, url) {
	try {

    //to launch browser we have launch inbuild method that we will use here and pass some keys
    const browser = await puppeteer.launch({ headless: false });

    //This will create new page for us
    const page = await browser.newPage();

    // this url of website that we will provide in this case we have specific website of indeed
    const pageUrl = `${url}`;

    //this inbuild goto method will make us to jump on perticular website and will scrape the data
    await page.goto(pageUrl);
    console.log(pageUrl);

    //If we want to take screenshot of particular web page
    await page.screenshot({ path: "image.png", fullPage: true });

    //If we want to create pdf of particular page
    await page.pdf({ path: "image.pdf", formate:"A4"});

    // here query will pass that user can change according to their need of data
    await page.type("#text-input-what", searchQuery);

    //this click event will click on submit button after input fulfilled in input box
    await page.click("[type=submit]");

    //this timeout will give us time break meanwhile data will be scraped and we will get output
    await page.waitForTimeout(5000);

    //this will return us scraped data array
    const jobs = await page.evaluate(() => {

        let jobListings = [];

        let myData = document.querySelectorAll("#mosaic-provider-jobcards > ul > li");

        myData.forEach((el, index) => {

            let data = el.innerText.trim().split("\n");
            let count = 1;

            let part1 = "";
            let part2 = "";
            let part3 = "";
            for (let i = 4; i < data.length; i++) {
                part1 = part1 + data[i] + ".!";
            }
            for (let i = 3; i < data.length; i++) {
                part2 = part2 + data[i] + ".!";
            }
            for (let i = 6; i < data.length; i++) {
                part3 = part3 + data[6]+ ".!";
            }
            let myObj = {
                JobTitle: data[0],
                companyName: data[1] == "new" ? data[2] : data[1],
                Location: data[1] == "new" ? data[3] : data[2],
                JobDescription: data[1] == "new" ? part1 : part2,
                jobPostingTime: data[1] == "new" ? data[7]:data[6],
                url: document.querySelector(`#mosaic-provider-jobcards > ul > li:nth-child(${count}) > div > div.slider_container.css-77eoo7.eu4oa1w0 > div > div.slider_item.css-kyg8or.eu4oa1w0 > div > table.jobCard_mainContent.big6_visualChanges > tbody > tr > td > div.css-1m4cuuf.e37uo190 > h2 > a`).href,
            };
            count++;
            jobListings.push(myObj);
        });
        return { "jobs": jobListings };
    })
    console.log(jobs)

    //this will close the browser after data scrapped
    await browser.close();

    //this is node inbuild file system will provide us new json file in the form of data array
    fs.writeFile("jobList.json", JSON.stringify(jobs), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON file created, all data will be there.");
        }
    });

} catch (err) {
    await browser.close();
    console.log("Could not create a browser instance => : ", err);
}

}


//here we will provide the specific query and website from where we want data 
scrapeJobListings("Software Developer", "https://in.indeed.com/");
