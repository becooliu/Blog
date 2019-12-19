function formatDate(date) {
    return date.getFullYear()+"-"+date.getMonth()+1+"-"+date.getDate()+" "+(date.getHours < 10 ? "0"+date.getHours : date.getHours);
}