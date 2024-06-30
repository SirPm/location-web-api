import { createServer } from "http";

const config = {
	PORT: process.env.PORT || 8080,
	IPINFO_BASE_URL: process.env.IPINFO_BASE_URL || "",
	IPINFO_TOKEN: process.env.IPINFO_TOKEN || "",
};

const sendJsonResponse = (res, code, data) => {
	res.writeHead(code, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
};

const getVisitorName = (url) => {
	const visitorName = url.searchParams.get("visitor_name");
	if (!visitorName) {
		throw {
			code: 400,
			message: "visitor_name query parameter is missing!",
		};
	}
	return visitorName;
};

const fetchIpInfo = async () => {
	const response = await fetch(
		`${config.IPINFO_BASE_URL}/json?token=${config.IPINFO_TOKEN}`
	);
	if (!response.ok) {
		const result = await response.json();
		throw {
			code: result.status || 500,
			message: result.error?.message || "Error fetching IP info",
		};
	}
	return response.json();
};

const handleHelloRoute = async (res, url) => {
	try {
		const visitorName = getVisitorName(url);
		const ipInfo = await fetchIpInfo();
		const response = {
			client_ip: ipInfo.ip,
			location: ipInfo.city,
			greeting: `Hello, ${visitorName}! The temperature is 11 degrees Celsius in ${ipInfo.city}.`,
		};
		sendJsonResponse(res, 200, response);
	} catch (err) {
		sendJsonResponse(res, err.code || 500, {
			message: err.message || "Internal server error",
		});
	}
};

const server = createServer(async (req, res) => {
	try {
		if (req.method === "GET" && req.url.startsWith("/api/hello")) {
			const url = new URL(req.url, `http://${req.headers.host}`);
			await handleHelloRoute(res, url);
		} else {
			sendJsonResponse(res, 404, { message: "Route does not exist!" });
		}
	} catch (err) {
		sendJsonResponse(res, err.code || 500, {
			message: err.message || "Internal server error",
		});
	}
});

server.listen(config.PORT, () => {
	console.log(`Server listening on port ${config.PORT}`);
});
