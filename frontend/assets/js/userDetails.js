$('.initiate').on('click', function () {
    let targetID = $(this).attr('targetID');
    $.ajax({
        type: 'POST',
        url: '/initiate',
        data: {
            targetID: targetID
        },
        dataType: 'json'
    }).done(function () {
        console.log('done');
        location.reload();
    });
});
