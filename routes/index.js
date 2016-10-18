var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');

var syncData = require('../util/syncData');
syncData.syncData();

var convertString = require('../util/convertString');
var myPageHref = '/users/552f687b314b';

var myInfo = require('../proxy/myInfo');
var getURL = require('../proxy/getURL');

/* GET home page. */
router.get('/', function(req, res, next) {

    myInfo.getInfo(function (err, result) {
        if (err) return next(err);
        var myInfo = [];
        var myArticle = [];
        var followerList = [];
        var followingList = [];
        var dateList = [];

        result.forEach(function (info) {
            myInfo.push({
                date: info.date,
                following: info.following,
                follower: info.follower
            });
            followerList.push(info.follower);
            followingList.push(info.following);
            dateList.push(info.date.replace(/-/g, ''));
        });
        getURL.getPageContent('www.jianshu.com' + myPageHref, function (err, resT) {
            if (err) return next(err);
                var $ = cheerio.load(resT.text);
                $('.article-list li').each(function (idx, article) {
                    var $article = $(article);
                    myArticle.push({
                        article: $article.find('.title a').text(),
                        publishDate: $article.find('.time').attr('data-shared-at').split('T')[0],
                        articleHref: $article.find('.title a').attr('href').split(' '),
                        reading: convertString.getLatestNumberWithSpace($article.find('.list-footer a').eq(0).text()),
                        comment: convertString.getLatestNumberWithSpace($article.find('.list-footer a').eq(1).text()),
                        favorite: convertString.getLatestNumberWithSpace($article.find('.list-footer span').text())
                    })
                });
                res.render('index', {
                    info: myInfo,
                    myArticle: myArticle,
                    followerList: followerList,
                    followingList: followingList,
                    dateList: dateList.sort()
                });
            });
    });
});

module.exports = router;
