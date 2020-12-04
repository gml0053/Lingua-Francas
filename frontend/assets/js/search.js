$(function () {
    var searchField = $("#name-search");
    var searchButton = $("#search-button");

    searchButton.on("click", function () {
        var textQuery = searchField.val();
        if (textQuery == "") {
            location.reload();
        } else {
            $.ajax({
                type: "GET",
                url: "/searchUsers",
                data: {
                    textQuery: textQuery,
                },
                dataType: "html",
            }).done(function (html) {
                $("#users").empty();
                $("#users").append(html);
            });
        }
    });
});
