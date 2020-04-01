// Compiled using ts2gas 3.6.1 (TypeScript 3.8.3)
//import Calendar = GoogleAppsScript.Calendar.Calendar;
//import GmailThread = GoogleAppsScript.Gmail.GmailThread;
//import GmailMessage = GoogleAppsScript.Gmail.GmailMessage;
var CALENDAR_NAME = "DMM英会話";
var QUERY = "newer_than:7d is:unread from:noreply@eikaiwa.dmm.com subject:\"\u30EC\u30C3\u30B9\u30F3\u4E88\u7D04\"";
function main() {
    var results = threads()
        .map(messages)
        .map(calendarEvents)
        .map(register);
    if (results.every(isSucceededAll)) {
        threads()
            .map(read);
    }
    else {
        Logger.log("カレンダー登録に失敗しました");
    }
}
function threads() {
    return GmailApp.search(QUERY);
}
function messages(thread) {
    return thread.getMessages();
}
function calendarEvents(gmailMessages) {
    return gmailMessages.map(function (message) {
        var e = {
            date: "",
            name: "",
            time: ""
        };
        var body = message.getBody();
        var body = message.getBody();
        var match = body.match(/(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{1,2})の(.+)とのレッスン予約が完了しました。/);
        if (match !== null && match.length === 7) {
            e.name = "DMM\u82F1\u4F1A\u8A71 " + match[6] + " \u5148\u751F";
            e.date = match[1] + "-" + match[2] + "-" + match[3];
            e.time = match[4] + ":" + match[5] + ":00";
        }
        Logger.log(e.name + ", " + e.date + ", " + e.time);
        return e;
    });
}
function register(events) {
    var result = calendars()
        .map(function (calendar) {
        return events.map(function (e) {
            var startTime = new Date(e.date + "T" + e.time);
            var endTime = new Date(startTime.getTime());
            endTime.setMinutes(endTime.getMinutes() + 25);
            Logger.log(e.name + " (" + startTime + " - " + endTime + ")");
            calendar.createEvent(e.name, startTime, endTime);
            return true;
        });
    });
    return [].concat.apply([], result);
}
function calendars() {
    var result = CalendarApp.getCalendarsByName(CALENDAR_NAME);
    if (result.length === 0) {
        result.push(CalendarApp.createCalendar(CALENDAR_NAME));
    }
    return result;
}
function isSucceededAll(results) {
    return results.every(function (n) { return n; });
}
function read(thread) {
    thread.markRead();
}
