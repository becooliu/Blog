/* 获取评论 */



$(function(){
    let contentid = $('#content_id').val().trim(); //文章的id
    let commentListWrap = $('#comment_list_wrap'); //展示评论的容器
    let commentStr = '' //评论字符串

    $.ajax(
        {
            type: 'get',
            url: '/api/comments/get',
            dataType: 'json',
            data: {
                contentid
            },
            success: function(response) {
                if (response.code && response.code == '200' && response.data) {
                    
                    let comments = response.data
                    for (let i = 0, len = comments.length; i < len; i++) {
                        commentStr += `<div class="panel panel-default">
                        <div class="panel-heading">
                            <div class="row">
                            <div class="col-sm-6">${comments[i].username}</div>
                            <div class="col-sm-6 text-right">${formateDate(comments[i].postTime)}</div>
                            </div>
                            
                        </div>
                        <div class="panel-body">
                            ${comments[i].comments}
                        </div>
                        </div>`
                    }
                    commentListWrap.prepend(commentStr)
                } else {
                    commentStr = '客官，还没有人评论呢，来抢沙发吧！'
                    commentListWrap.append(commentStr)
                }
            },
            error: function(err) {
                throw new Error(err)
            }
        }
    )
})

/**
 * 提交评论
 */

$('#submit_comment').on('click', function(e) {
    e = e || window.event;
    e.preventDefault();

    let contentid = $('#content_id').val().trim();
    let content = $('#comment').val().trim();

    if(content.length < 1) {
        console.log('评论内容不能为空。')
        return ;
    }

    $.ajax({
        type: 'POST',
        url: '/api/comments/post',
        dataType: 'json',
        data: {
            contentid,
            content
        },
        success: function(response){
            if(response.code === '200') {
                let commentData = response.data
                let commentStr = ''
                let commentListWrap = $('#comment_list_wrap')
                
                commentStr += `<div class="panel panel-default">
                <div class="panel-heading">
                    <div class="row">
                    <div class="col-sm-6">${commentData.username}</div>
                    <div class="col-sm-6 text-right">${formateDate(commentData.postTime)}</div>
                    </div>
                    
                </div>
                <div class="panel-body">
                    ${commentData.comments}
                </div>
                </div>`
                
                commentListWrap.prepend(commentStr)
            }
        },
        error: function(err) {
            throw new Error(err)
        }
    })
})

function formateDate(str) {
    let oDate = new Date(str)
    return oDate.getFullYear() + '-' + (oDate.getMonth()+1) +'-' + oDate.getDate() +' '+ oDate.getHours() + ':' + oDate.getMinutes() +':'+ oDate.getSeconds()
}