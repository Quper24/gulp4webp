const gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    posthtml = require('gulp-posthtml'),
    include = require('posthtml-include'),
    rename = require("gulp-rename"),
    webp = require("gulp-webp"),
    htmlmin = require('gulp-htmlmin'),
    criticalCss = require('gulp-critical-css'),
    imageResize = require('gulp-image-resize');


const html = () => {
        return gulp.src("./src/*.html")
            .pipe(posthtml([
                include()
            ]))
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest("./build/"))
            .pipe(browserSync.stream());

    },

    copy = () => {
        return gulp.src([
                './src/fonts/**/*.*',
                './src/libs/**/*.*',
                './src/favicon/**/*.*',
                './src/*.ico'
            ],
            {
                base: "src"
            })
            .pipe(gulp.dest('./build/'))
    },

    styles = () => {
        return gulp.src('./src/scss/**/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(gulp.dest('./build/css'))
            .pipe(cleanCSS({
                level: 2
            }))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('./build/css'))
            .pipe(browserSync.stream())

    },



    scripts = () => {
        return gulp.src('./src/js/**/*.js')
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(uglify())
            .pipe(gulp.dest('./build/js'))
            .pipe(browserSync.stream());

    },


    imgresize = () => {
        return gulp.src('src/images/**/*.{jpg,png}"')
            .pipe(imageResize({
                width: 900,
                crop: false,
                imageMagick: true
            }))
            .pipe(gulp.dest("build/images/"));
    },

    img = () => {
        return gulp.src('src/images/**/*.*')
            .pipe(imagemin([
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.optipng({
                    optimizationLevel: 3
                }),
                imagemin.jpegtran({
                    progressive: true
                }),

                imagemin.svgo({
                    plugins: [{
                        removeViewBox: true
                    },
                        {
                            cleanupIDs: false
                        }
                    ]
                })
            ]))
            .pipe(gulp.dest('build/images/'));
    },

    imagewebp = () => {
        return gulp.src("src/images/**/*.{png,jpg}")
            .pipe(webp({
                quality: 90
            }))
            .pipe(gulp.dest("build/images/"));
    },

    clean = () => {
        return del(['build/*']);
    },


    watch = () => {
        browserSync.init({
            server: {
                baseDir: "./build/"
            },
            tunnel: true
        });
        gulp.watch('./src/**/*.html', html);
        gulp.watch('./src/scss/**/*.scss', styles);
        gulp.watch('./src/js/**/*.js', scripts);
        gulp.watch('./src/images/**/*.*', img);
        gulp.watch('./src/images/**/*.{png,jpg}', imagewebp);
    };

gulp.task('html', html);
gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('imgresize', imgresize)
gulp.task('img', img);
gulp.task('webp', imagewebp);
gulp.task('copy', copy);


gulp.task('clean', clean);

gulp.task('watch', watch);
gulp.task('build', gulp.parallel(styles, scripts)
);


gulp.task('dev', gulp.series('build', 'html', 'img', 'webp', 'copy', 'watch'));
gulp.task('production', gulp.series('clean', 'dev'));