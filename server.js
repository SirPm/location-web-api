import { createServer } from "http";

const config = {
	PORT: process.env.PORT || 8080,
	WEATHER_API_BASE_URL: process.env.WEATHER_API_BASE_URL || "",
	WEATHER_API_KEY: process.env.WEATHER_API_KEY || "",
};

const sendJsonResponse = (res, code, data) => {
	res.writeHead(code, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
};

const parseIp = (req) => {
	return (
		req.headers["x-forwarded-for"]?.split(",").shift() ||
		req.socket?.remoteAddress
	);
};

const getVisitorName = (url) => {
	const visitorName = url.searchParams.get("visitor_name");
	if (!visitorName) {
		throw {
			code: 400,
			message: "visitor_name query parameter is missing!",
		};
	}
	return visitorName.replace(/["']/g, "");
};

const fetchLocationInfo = async (city) => {
	const response = await fetch(
		`${config.WEATHER_API_BASE_URL}/current.json?key=${config.WEATHER_API_KEY}&q=${city}`
	);
	if (!response.ok) {
		const result = await response.json();
		throw {
			code: result.status || 500,
			message: result.error?.message || "Error fetching weather info",
		};
	}
	return response.json();
};

const handleHelloRoute = async (req, res, url) => {
	try {
		const visitorName = getVisitorName(url);
		const ip = parseIp(req);
		const locationInfo = await fetchLocationInfo(ip);
		const city = locationInfo.location.name;
		const temperature = locationInfo.current.temp_c;
		const response = {
			client_ip: ip,
			location: city,
			greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}.`,
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
			await handleHelloRoute(req, res, url);
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
