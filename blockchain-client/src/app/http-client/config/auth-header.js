const authHeader = () => {
	// return authorization header with jwt token
	let token = localStorage.getItem("accessToken");

	if (token) {
		return { Authorization: token };
	} else {
		return {};
	}
};

export { authHeader };
