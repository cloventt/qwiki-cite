import  { scrapeJsonLd } from '../../src/ldjson-parser';
import { describe, test } from "mocha";
import { expect } from "chai";

describe('json+ld parser', async () => {

    test('works for springer journal article', async () => {
        const input = '{"mainEntity":{"headline":"Nuclear Weapons Tests and Environmental Consequences: A Global Perspective","description":"The beginning of the atomic age marked the outset of nuclear weapons testing, which is responsible for the radioactive contamination of a large number of sites worldwide. The paper aims to analyze nuclear weapons tests conducted in the second half of the twentieth century, highlighting the impact of radioactive pollution on the atmospheric, aquatic, and underground environments. Special attention was given to the concentration of main radioactive isotopes which were released, such as 14C, 137Cs, and 90Sr, generally stored in the atmosphere and marine environment. In addition, an attempt was made to trace the spatial delimitation of the most heavily contaminated sites worldwide, and to note the human exposure which has caused a significantly increased incidence of thyroidal cancer locally and regionally. The United States is one of the important examples of assessing the correlation between the increase in the thyroid cancer incidence rate and the continental-scale radioactive contamination with 131I, a radioactive isotope which was released in large amounts during the nuclear tests carried out in the main test site, Nevada.","datePublished":"2014-02-22T00:00:00Z","dateModified":"2014-02-22T00:00:00Z","pageStart":"729","pageEnd":"744","sameAs":"https://doi.org/10.1007/s13280-014-0491-1","keywords":["Environment","general","Ecology","Atmospheric Sciences","Physical Geography","Environmental Management","Environmental Engineering/Biotechnology"],"image":["https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig1_HTML.gif","https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig2_HTML.gif","https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig3_HTML.gif","https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig4_HTML.gif","https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig5_HTML.gif","https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig6_HTML.gif","https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig7_HTML.gif","https://media.springernature.com/m685/springer-static/image/art%3A10.1007%2Fs13280-014-0491-1/MediaObjects/13280_2014_491_Fig8_HTML.gif"],"isPartOf":{"name":"AMBIO","issn":["1654-7209","0044-7447"],"volumeNumber":"43","@type":["Periodical","PublicationVolume"]},"publisher":{"name":"Springer Netherlands","logo":{"url":"https://www.springernature.com/app-sn/public/images/logo-springernature.png","@type":"ImageObject"},"@type":"Organization"},"author":[{"name":"Remus Prăvălie","affiliation":[{"name":"Bucharest University","address":{"name":"Faculty of Geography, Bucharest University, Bucharest, Romania","@type":"PostalAddress"},"@type":"Organization"}],"email":"pravalie_remus@yahoo.com","@type":"Person"}],"isAccessibleForFree":false,"hasPart":{"isAccessibleForFree":false,"cssSelector":".main-content","@type":"WebPageElement"},"@type":"ScholarlyArticle"},"@context":"https://schema.org","@type":"WebPage"}';
        const parsed = await scrapeJsonLd(input);
        expect(parsed).to.deep.include({
            type: 'journal',
            title: 'Nuclear Weapons Tests and Environmental Consequences: A Global Perspective',
            provider: 'Springer Netherlands',
            published: '2014-02-22T00:00:00.000Z',
            author: 'Remus Prăvălie',
            urlAccess: 'subscription',
            pages: '729-744',
            journal: 'AMBIO',
            issn: '1654-7209',
            volume: '43'
          });
    })

    test('works for WSJ news article', async () => {
        const input = '[{"@context":"https://schema.org","@type":"VideoObject","contentUrl":"https://m.wsj.net/video/20240102/91936619-38db-4325-a81a-18931e65fce4/2/hls/manifest-hd-wifi.m3u8","description":"Harvard University President Claudine Gay resigned after facing accusations of plagiarism and a backlash against her response to antisemitism on campus. Photo: Ken Cedeno/Reuters","duration":"PT2M1S","embedUrl":"https://video-api.wsj.com/api-video/player/v3/iframe.html?guid=91936619-38DB-4325-A81A-18931E65FCE4","name":"Claudine Gay Resigns as Harvard President","thumbnailUrl":"https://images.wsj.net/im-907398?width=1920&height=1080"},{"@context":"https://schema.org","@type":"ImageObject","caption":"Applications for early admission to Harvard fell this cycle, while other extremely selective colleges reported upticks.","contentUrl":"https://images.wsj.net/im-907499","creator":{"@type":"Person","name":"Steven Senne/Associated Press"}},{"@context":"https://schema.org","@type":"ImageObject","caption":"Billionaire investor and Harvard alum Bill Ackman on Wednesday called on the Harvard Corporation’s members to resign.","contentUrl":"https://images.wsj.net/im-907801","creator":{"@type":"Person","name":"RICHARD BRIAN/REUTERS"}},{"@context":"https://schema.org","@type":"ImageObject","caption":"Claudine Gay, who resigned as Harvard’s president, faced criticism for a relatively thin portfolio of published research.","contentUrl":"https://images.wsj.net/im-907802","creator":{"@type":"Person","name":"Brian Snyder/Reuters"}},{"@context":"https://schema.org","@type":"WebPage","dateCreated":"2024-01-03T10:30:00.000Z","dateModified":"2024-01-03T23:45:00.000Z","datePublished":"2024-01-03T10:30:00.000Z","description":"University must find a new president and address rifts among faculty, students and donors","image":["https://images.wsj.net/im-907499?width=1280&size=1","https://images.wsj.net/im-907499?width=1280&size=1.33333333","https://images.wsj.net/im-907499?width=1280&size=1.77777778"],"inLanguage":"en_US","publisher":{"@id":"https://www.wsj.com/#publisher"}},{"@context":"https://schema.org","@type":"NewsArticle","articleSection":"US","author":[{"@type":"Person","name":"Melissa Korn","sameAs":"https://www.wsj.com/news/author/melissa-korn"}],"dateCreated":"2024-01-03T10:30:00.000Z","dateModified":"2024-01-03T23:45:00.000Z","datePublished":"2024-01-03T10:30:00.000Z","description":"University must find a new president and address rifts among faculty, students and donors","hasPart":{"@type":"WebPageElement","cssSelector":".paywall","isAccessibleForFree":false},"isPartOf":{"@type":["CreativeWork","Product"],"description":"Breaking news and analysis from the U.S. and around the world at WSJ.com. Politics, Economics, Markets, Life & Arts, and in-depth reporting.","name":"The Wall Street Journal","productID":"wsj.com:WSJ-SwG-AllAccessDigital"},"headline":"Where Does Harvard Go From Here as Claudine Gay Is Out as President?","image":["https://images.wsj.net/im-907499?width=1280&size=1","https://images.wsj.net/im-907499?width=1280&size=1.33333333","https://images.wsj.net/im-907499?width=1280&size=1.77777778"],"isAccessibleForFree":false,"keywords":["North America","United States","Political/General News","Society/Community","Discrimination","Education","Human Rights/Civil Liberties","LGBT Rights","Politics/International Relations","Domestic Politics","Racism/Xenophobia","Social Issues","University/College","SYND","WSJ-PRO-WSJ.com","Career Education","LINK|i9-WP-WSJ-0001465586","LINK|i5-WP-WSJ-0001465586","LINK|i1-WP-WSJ-0001465586","LINK|i7-WP-WSJ-0001465586","LINK|i3-WP-WSJ-0001465586","LINK|i4-WP-WSJ-0001465586","LINK|i11-WP-WSJ-0001465586","LINK|i2-WP-WSJ-0001465586","LINK|i6-WP-WSJ-0001465586","LINK|i12-WP-WSJ-0001465586","political","general news","society","community","discrimination","education","human rights","civil liberties","lgbt rights","politics","international relations","domestic politics","racism","xenophobia","social issues","university","college","career education","north america","united states"],"mainEntityOfPage":{"@id":"https://www.wsj.com/us-news/education/claudine-gay-is-out-as-president-where-does-harvard-go-from-here-ea9b9fde","@type":"WebPage"},"publisher":{"@id":"wsj.com","@type":"NewsMediaOrganization","logo":{"@type":"ImageObject","height":60,"url":"https://s.wsj.net/media/wsj_amp_masthead_lg.png","width":576},"name":"The Wall Street Journal"},"thumbnailUrl":"https://images.wsj.net/im-907499?width=1280&size=1","url":"https://www.wsj.com/us-news/education/claudine-gay-is-out-as-president-where-does-harvard-go-from-here-ea9b9fde"},{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","item":"https://www.wsj.com/us-news?mod=breadcrumb","name":"U.S.","position":1},{"@type":"ListItem","item":"https://www.wsj.com/us-news/education?mod=breadcrumb","name":"U.S. Education News","position":2}]}]';
        const parsed = await scrapeJsonLd(input);
        expect(parsed).to.deep.include({
            language: 'en-US',
            published: '2024-01-03T10:30:00.000Z',
            type: 'news',
            title: 'Where Does Harvard Go From Here as Claudine Gay Is Out as President?',
            provider: 'The Wall Street Journal',
            url: 'https://www.wsj.com/us-news/education/claudine-gay-is-out-as-president-where-does-harvard-go-from-here-ea9b9fde',
            author: 'Melissa Korn'
          });
    })

    test('works for The Press news article', async () => {
        const input = `{"@context":"https://schema.org","@type":"NewsArticle","articleSection":"NZ news","author":{"@type":"Person","name":"Liz McDonald"},"dateModified":"2024-01-04T16:00:00Z","datePublished":"2024-01-04T16:00:00Z","description":"The 163-year-old Victorian timber building is for sale, but the owners will continue running their award-winning restaurant and boutique hotel.","headline":"Heritage mansion Eliza's Manor to be sold at auction","image":{"@type":"ImageObject","url":"https://www.thepress.co.nz/media/images/9Tzi8ywRz924XE3uHaD6DZ3Ef+IdbOiYlvIROR5vlqUeRrexTocZGobKRJ9od%2Fgnk3B%2FCeKTmTAsIjj6Q0YaYdN28GkA04F2y1RQ1ZoH0yWOuAv%2F+ic+eLxW+Ft7ISJSHz0v35kGsgiliGWKD35Ez3iH6a%2F1k1ygjJUneNTsTuZwVD%2FFF45q4jsD8ouGuoSBt8%2FaLBDtmBNQZyss4iQPDhhw6QTemWgxyvwD8GgMR3LaLoS7MEMzj4f%2FW64j6ahhJd9Dhfwn5v4XILwnR97b3QL2hZrEViWh7xypvMlCAOJzO6SoMjqwzIsd%2FfyZguHrTBq8AdvbRfaxJVN4KcmEKjTBE%2Fg8me5WaDSLkz7dRJ6iKpPrj7gs6HPwpBlqLqGm?resolution=1240x700"},"inLanguage":"en","isAccessibleForFree":"False","keywords":["Christchurch","New Zealand","Wānaka","Eliza's Manor","Harold Williams"],"mainEntityOfPage":{"@type":"WebPage","@id":"https://www.thepress.co.nz/nz-news/350141274/heritage-mansion-elizas-manor-be-sold-auction"},"publisher":{"@type":"Organization","name":"The Press"},"url":"https://www.thepress.co.nz/nz-news/350141274/heritage-mansion-elizas-manor-be-sold-auction","wordCount":2667}`;
        const parsed = await scrapeJsonLd(input);
        expect(parsed).to.deep.include({
            title: "Heritage mansion Eliza's Manor to be sold at auction",
            provider: 'The Press',
            language: 'en',
            published: '2024-01-04T16:00:00.000Z',
            url: 'https://www.thepress.co.nz/nz-news/350141274/heritage-mansion-elizas-manor-be-sold-auction',
            author: 'Liz McDonald',
            type: 'news',
            urlAccess: 'subscription'
          });
    })

    test('works for worldcat book', async () => {
        const input = '{\n      "@context":"https://schema.org",\n      "@type":"DataFeed",\n      "dataFeedElement": [\n        {\n          "@context": "https://schema.org",\n          "@id": "https://search.worldcat.org/title/156749714",\n          "@type": "Book",\n          "author": {\n            "@type": "Person",\n            "name": "D. A. Hills,Helen Hills"\n          },\n          "name": "Settling near the Styx River",\n          "url": "https://search.worldcat.org/title/156749714",\n          "workExample": [\n            {\n              "@id": "https://search.worldcat.org/title/156749714",\n              "@type": "Book",\n              "bookFormat": "https://schema.org/Hardcover",\n              "inLanguage": "eng",\n              "isbn": "9780473111342"\n              ,"potentialAction":{\n        "@type": "ReadAction",\n        "target": {\n            "@type": "EntryPoint",\n            "urlTemplate": "http://example.com/store/9787543321724",\n            "actionPlatform": [\n                "https://schema.org/DesktopWebPlatform",\n                "https://schema.org/AndroidPlatform",\n                "https://schema.org/IOSPlatform"\n            ]\n        },\n        "expectsAcceptanceOf": [{\n         "@type": "Offer",\n         "category": "purchase",\n         "price": "45.00",\n         "priceCurrency": "USD",\n         "eligibleRegion": {\n             "@type": "Country",\n             "name": "US"\n         }\n       }]\n    },\n              "bookEdition": "null",\n              "datePublished": "c2006",\n              "identifier": {\n                "@type": "PropertyValue",\n                "propertyID": "OCLC_NUMBER",\n                "value": 156749714\n              },\n              "url": "https://search.worldcat.org/title/156749714"\n            }\n          ]\n        }\n      ]\n    }';
        const parsed = await scrapeJsonLd(input);
        expect(parsed).to.deep.include({
            title: 'Settling near the Styx River',
            url: 'https://search.worldcat.org/title/156749714',
            author: 'D. A. Hills,Helen Hills',
            type: 'book',
            language: 'en',
            published: 'c2006'
          });
    })

    test('works for empty input', async () => {
        const input = '';
        const parsed = await scrapeJsonLd(input);
        expect(parsed).to.deep.include({});
    })

    test('works for dodgy not-json', async () => {
        const input = 'not a json string';
        const parsed = await scrapeJsonLd(input);
        expect(parsed).to.deep.include({});
    })

    test('works for dodgy json', async () => {
        const input = '{"@context":"https://schema.org","@type":"WebSite","url":"","potentialAction":{"@type":"SearchAction","target":"","query-input":"required name=search_term"}}' ;
        const parsed = await scrapeJsonLd(input);
        expect(parsed).to.deep.include({});
    })
})

