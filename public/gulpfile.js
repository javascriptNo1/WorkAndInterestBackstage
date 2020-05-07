// 引入依赖gulp
var gulp = require('gulp');
// 引入es6语法的编译工具
var babel=require('gulp-babel');
//引入压缩js的插件
var uglify = require('gulp-uglify');
//引入重命名插件
var rename = require('gulp-rename');
//引入压缩css的插件
var cleanCss = require('gulp-clean-css');
//引入编译less插件
var less = require('gulp-less');
//引入压缩图片的插件
var imagemin = require('gulp-imagemin');
//引入删除的插件
var del = require('del');
//串行任务
var runSequence = require('run-sequence');
//引入热更新插件
var livereload = require('gulp-livereload');
//引入webserver
var  webserver = require('gulp-webserver');





// 开启压缩js的任务
gulp.task('uglify', function () {
    gulp
        .src('./scripts/js/*.js')               //确定源
        // 压缩前对es6语法编译成es5写法
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())                //处理
        .pipe(rename({
            suffix: '.min'             // 重命名
        }))
        .pipe(gulp.dest('dist/js/'))   // 确定输出的路径
           .pipe(livereload());  //热更新
});


//压缩css
gulp.task('cleanCss', function () {
    gulp
        .src('./styles/css/*.css')   //源
        .pipe(cleanCss())            //处理
        .pipe(rename({
            suffix: '.min'           //重命名
        }))
        .pipe(gulp.dest('dist/css'))  // 目标
           .pipe(livereload());  //热更新
});


//编译less
gulp.task('less', function () {
    gulp
        .src('./styles/less/*.less')   //源
        .pipe(less())                  //处理
        .pipe(gulp.dest('styles/css/'))  // 目标
           .pipe(livereload());  //热更新
});

// 压缩图片
gulp.task('imagemin', function () {
    gulp
        .src('images/**')   //源
        .pipe(imagemin())                  //处理
        .pipe(gulp.dest('dist/images/'))  // 目标
});

//开启web服务器
gulp.task('webserver', function() {
    gulp.src( './' )               // 服务器目录（./代表根目录）
        .pipe(webserver({         // 运行gulp-webserver
            livereload: true,     // 启用LiveReload
            open: true           // 服务器启动时自动打开网页
        }));
});


/*
* 观察者：
*/
gulp.task('mywatch', function() {
    //监听热跟新
       livereload.listen();
    gulp.watch("scripts/js/*.js",["uglify"]);  //观察js的变动  变动的话就执行压缩任务
    gulp.watch("styles/less/*.less",["less"]);  //观察less
    gulp.watch("styles/css/*.css",["cleanCss"]);  //观察css

});

gulp.task("default",["mywatch"]);

