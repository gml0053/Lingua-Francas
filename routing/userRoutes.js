module.exports = function (app, userHandler, passport) {
	app.get("/login", function (req, res) {
		res.render("pages/login.njk");
	});

	app.get("/success", function (req, res) {
		res.render("index.html", { title: "Success Page" });
	});

	app.get(
		"/google",
		passport.authenticate("google", {
			scope: ["https://www.googleapis.com/auth/plus.login"],
		})
	);

	app.get(
		"/google/callback",
		passport.authenticate("google", { failureRedirect: "/login" }),
		function (req, res) {
			res.redirect("/success");
		}
	);
};
