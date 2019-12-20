//import { json } from "body-parser";

$(function(){ 
    //添加内容
    var add_content = $('#add_content, #edit_content');
    add_content.on('click', function(e){
        let category = $('#category');
        let title = $('#title');
        let content = $('#content');

        if(!category.val().trim()) {
            category.focus().parent().addClass('has-error');
            e.preventDefault();
        }
        if(!title.val().trim()) {
            title.focus().parent().addClass('has-error');
            e.preventDefault();
        }
        if(!content.val().trim()) {
            content.focus().parent().addClass('has-error');
            e.preventDefault();
        }
    })
})
