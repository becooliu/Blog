$(function(){
    //登录和注册框的显示和隐藏
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    let userInfo = {};

    $loginBox.children('a').on('click', function(){
        $registerBox.show();
        $loginBox.hide();
    })
    $registerBox.children('a').on('click', function(){
        $loginBox.show();
        $registerBox.hide();
    })

    $registerBox.children('button').on('click', function(){
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                repassword: $registerBox.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function(result){
                //显示注册提示信息
                $registerBox.children('p.warning-info').text(result.message);
                //注册成功跳转到登录页
                console.log('result.code='+result.code);
                if(result.code === '3') {
                    setTimeout(function(){
                        $loginBox.show();
                        $registerBox.hide();
                    },2000)
                }
            }
        })
    })

    //登录
    $loginBox.children('button').on('click', function(){
        let $username = $loginBox.children('[name="username"]').val();
        let $password = $loginBox.children('[name="password"]').val();
        let $warningBox = $loginBox.children('.warning-info');
        
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            dataType: 'json',
            data: {
                username: $username,
                password: $password
            },
            success: function(result){
                $warningBox.text(result.message);
                let $userInfoBox = $('.user-info-box');
                setTimeout(() => {
                    window.location.reload();
                    /* $loginBox.hide(); */
                    if($username == 'admin'){
                        $userInfoBox.find('.admin-info').removeClass('hide');
                    }
                    /* $userInfoBox.show();
                    userInfo.username = result.userInfo.username;
                    $userInfoBox.find('.username').text(userInfo.username); */
                }, 2000);
                //sconsole.log(result.message);
            }
        })
    })

    //退出
    $('#logout').on('click' , function(){
        $.ajax({
            url: '/api/user/logout',
            success: function(result) {
                console.log(result);
                if(result.code == 'null') {
                    window.location.reload();
                }
            }
        })
    })
})