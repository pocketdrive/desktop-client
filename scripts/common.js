let login = function () {
    let host = $('#host').val();
    let username = $('#username').val();
    let password = $('#password').val();

    $.ajax({
        type: "POST",
        url: "http://192.168.8.103/dulaj/paths.php/login",
        // The key needs to match your method's input parameter (case-sensitive).
        data: JSON.stringify({ username:username, password:password }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){
            if(data.success === true){
                let shareName = '\\\\' + host + '\\' + data.sharename;
                mount(shareName, data.user, data.password);
            } else{
                alert('Server error occurred');
            }
        },
        failure: function(error) {
            alert(error);
        }
    });

   return false;
}
