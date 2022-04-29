function doGet() {
	var page = UrlFetchApp.fetch('http://www.totalcorner.com/match/today').getContentText();
	var doc = Xml.parse(page, true);
	var matchTable = doc.html.body.div[1].div[0].div[2].div[1].table.tbody[2].toXmlString();
	doc = XmlService.parse(matchTable.replace(/Half/g, "45"));
	var matchesArray = getMatches(doc.getRootElement());

	matchesArray.sort(function(a, b) {
		return b.F - a.F;
	});

	var options = {
		'method': 'put',
		'contentType': 'application/json',
		// Convert the JavaScript object to a JSON string.
		'payload': JSON.stringify(matchesArray)
	};
	UrlFetchApp.fetch('https://kladara-19a52.firebaseio.com/games.json', options);

	options.method = 'post';
	UrlFetchApp.fetch('https://kladara-19a52.firebaseio.com/historic.json', options);

	//return ContentService.createTextOutput(JSON.stringify(matchesArray)).setMimeType(ContentService.MimeType.JSON);
}

function calc(a, b, c, d, e, f) {
	var x = 4 * (a - b) + (c - d) + 2 * (e - f)
	x = Math.round(x * 100) / 100
	return x
}

function color(hs, as) {
	var x = Math.abs(hs - as);
	switch (true) {
		case (x >= 10):
			return "#f2dede";
		case (x >= 5):
			return "#d0e9c6";
		default:
			return "none";
	}
}

function getMatches(element) {
	var data = [];
	var tableRows = element.getChildren();

	Logger.log(tableRows.length);

	// tr
	for (i in tableRows) {
		var elt = tableRows[i].asElement();
		if (elt != null) {

			var children = elt.getChildren()
			if (children[3].getValue().trim() == "") {
				break;
			}
			//Logger.log(elt);   
			var tempMatch = new Object();
			//tempMatch.mi = Number(elt.getAttribute('data-match_id').getValue());
			//tempMatch.li = Number(elt.getAttribute('data-league_id').getValue());
			tempMatch.le = children[1].getValue().trim();
			tempMatch.min = Number(children[3].getValue().trim());
			tempMatch.ht = children[4].getChild("a").getValue().trim();
			tempMatch.at = children[6].getChild("a").getValue().trim();
			var score = children[5].getValue().split(" - ");
			tempMatch.hg = Number(score[0]);
			tempMatch.ag = Number(score[1]);
			var CO = children[8].getChild("div").getChild("span").getValue().split(" - ");
			tempMatch.hc = Number(CO[0]);
			tempMatch.ac = Number(CO[1]);
			var DA = children[10].getChild("div").getValue().split(" - ");
			tempMatch.ha = Number(DA[0]);
			tempMatch.aa = Number(DA[1]);
			var SOT = children[11].getChild("div").getValue().split(" - ");
			tempMatch.hs = Number(SOT[0]);
			tempMatch.as = Number(SOT[1]);

			tempMatch.C = color(tempMatch.hs, tempMatch.as)

			var calc1 = calc(tempMatch.hs, tempMatch.as, tempMatch.ha, tempMatch.aa, tempMatch.hc, tempMatch.ac)
			tempMatch.X = calc1 > 0 ? 1 : 2
			tempMatch.F = Math.abs(calc1)

			data.push(tempMatch);
		}
	}
	return data;
}