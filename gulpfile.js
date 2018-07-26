const gulp = require('gulp');
const glob = require('glob');
const webpack = require('webpack');
const dalaran = require('dalaran');
const path = require('path');
const pug = require('pug');
const fs = require('fs-extra');
const less = require('gulp-less');
const yaml = require('yaml-js');
const marked = require('marked');
const watch = require('gulp-watch');
const highlight = require('gulp-highlight-code');
const handlebars = require('handlebars');

const providePluginOptions = {};
glob.sync('src/**/G3D.*.js').forEach(item => {
    const name = item.split('.')[1];
    providePluginOptions[name] = path.join(__dirname, item);
});

const libraryTasks = dalaran.libraryTasks({
    umdName: 'G3D',
    demo: './demo',
    entry: './src/G3D.js',
    port: 3000,
    loaders: [{
        test: /\.glsl$/,
        use: [
            'raw-loader',
            path.resolve('./loader.js')
        ]
    }],
    plugins: [
        new webpack.ProvidePlugin(providePluginOptions)
    ],
    devCors: true,
    testEntryPattern: 'test/**/*.spec.js',
    eslint: false,
    liveReload: true,
    htmlTemplate: './demo/template/html.handlebars',
    jsTemplate: './demo/template/js.handlebars'
});

gulp.task('library-test', libraryTasks.test);
gulp.task('library-dev', libraryTasks.dev);
gulp.task('library-build', libraryTasks.build);
gulp.task('library-demo', libraryTasks.demo);
gulp.task('library-demoformat', function () {

    const jsTemplate = handlebars.compile(fs.readFileSync('./demo/template/js.handlebars', 'utf-8'));
    const htmlTemplate = handlebars.compile(fs.readFileSync('./demo/template/html.handlebars', 'utf-8'));

    glob.sync('demo/*.js').forEach(item => {

        const name = item.match(/demo\/([0-9a-zA-Z\-]+)\.js/);

        if (name && name[1]) {
            const data = fs.readFileSync(item, 'utf-8');

            if (data.indexOf('G3D_TEMPLATE_GENERATED') !== -1) {
                fs.writeFileSync(
                    item,
                    jsTemplate({
                        name: name[1],
                        liveReload: true
                    })
                );
            }
        }

    });

    glob.sync('demo/*.html').forEach(item => {

        const name = item.match(/demo\/([0-9a-zA-Z\-]+)\.html/);

        if (name && name[1]) {
            const data = fs.readFileSync(item, 'utf-8');

            if (data.indexOf('G3D_TEMPLATE_GENERATED') !== -1) {
                fs.writeFileSync(
                    item,
                    htmlTemplate({
                        name: name[1],
                        liveReload: true
                    })
                );
            }
        }
    })


});

const homePageTasks = (function () {

    const templates = {

        index: pug.compile(
            fs.readFileSync('./website/homepage-src/template/index.pug', 'utf-8'),
            {
                filename: './website/homepage-src/template/index.pug',
                pretty: true
            }
        ),
        doc: pug.compile(
            fs.readFileSync('./website/homepage-src/template/doc.pug', 'utf-8'),
            {
                filename: './website/homepage-src/template/doc.pug',
                pretty: true
            }
        )
    }

    function build() {

        const option = {
            root: './'
        }

        fs.writeFileSync('./website/homepage/index.html', templates.index(option));

        const doc = yaml.load(fs.readFileSync('./website/homepage-src/doc.yaml')).doc;

        Object.keys(doc).forEach(scope => {

            function deal(docs, k, s) {
                if (typeof docs === 'string') {
                    const content = fs.readFileSync(`./doc/${scope}/${k}.md`, 'utf-8');

                    if (content) {

                        let html = templates.doc(
                            {
                                index: doc[scope],
                                content: marked(content),
                                root: '../'
                            }
                        );
                        // html = hljs.highlight('javascript', html).value;
                        fs.outputFileSync(`./website/homepage/${scope.split('-').join('/')}/${k}.html`, html);
                    } else {
                        throw new Error('Read source file failed, please run gulp fetch first.');
                    }
                } else {
                    for (let key in docs) {
                        deal(docs[key], key, docs);
                    }
                }
            }

            deal(doc[scope]);
        });

        return gulp.src('./website/homepage/*/*.html')
            .pipe(highlight())
            .pipe(gulp.dest('./website/homepage/'));
    }

    function lessTask() {
        return gulp.src('./website/homepage-src/style/index.less')
            .pipe(less())
            .pipe(gulp.dest('./website/homepage'));
    }

    function watchLessTask() {
        return watch('./website/homepage-src/style/index.less')
            .pipe(less())
            .pipe(gulp.dest('./website/homepage'));
    }

    function assets() {
        return gulp.src('./website/homepage-src/assets/**')
            .pipe(gulp.dest('./website/homepage/assets/'));
    }

    return { build, less: lessTask, watchLess: watchLessTask, assets };

})();

gulp.task('homepage-less', homePageTasks.less);
gulp.task('homepage-less-watch', homePageTasks.watchLess);
gulp.task('homepage-assets', homePageTasks.assets);
gulp.task('homepage-build', ['homepage-less', 'homepage-assets'], homePageTasks.build);

const playgroundTasks = (function () {

    const tasks = dalaran.applicationTasks({
        demo: './website/playground-src',
        dist: './website/playground',
        port: 3001,
        react: true,
        loaders: [{
            test: /\.glsl$/,
            use: [
                'raw-loader',
                path.resolve('./loader.js')
            ]
        }, {
            test: /\.playground.js$/,
            use: 'raw-loader'
        }, {
            test: /\.txt.vue$/,
            use: 'raw-loader'
        }, {
            test: /\.txt.js$/,
            use: 'raw-loader'
        }],
        plugins: [
            new webpack.ProvidePlugin(providePluginOptions)
        ],
        devCors: true,
        commonsChunk: false,
        eslint: false
    });

    function samples() {
        const files = glob.sync('./website/playground-src/samples/**/*.playground.js').map(file => {
            return file.substring(file.indexOf('/guide') + 1, file.indexOf('.playground'));
        });

        const obj = {};
        files.forEach(function (file) {
            const dirs = file.split('/');
            const fileName = dirs.pop();
            let target = obj;
            dirs.forEach(function (dir) {
                if (!target[dir]) {
                    target[dir] = {};
                }
                target = target[dir];
            });
            target[fileName] = '<<<' + file + '>>>'
        });

        let str = JSON.stringify(obj, null, 2);
        str = str.replace(/\"<<</g, 'require("./');
        str = str.replace(/>>>\"/g, '.playground.js")');
        str = 'module.exports = ' + str;

        fs.outputFileSync('./website/playground-src/samples/index.js', str);
    }

    return Object.assign({ samples }, tasks);

})();

gulp.task('playground-samples', playgroundTasks.samples);
gulp.task('playground-dev', ['playground-samples'], playgroundTasks.dev);
gulp.task('playground-build', ['playground-samples'], playgroundTasks.build);

gulp.task('website', ['homepage-build', 'playground-build'], function () { });