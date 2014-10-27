;(function(window){
    var seacss = {

        // ͬseajs��base��ģ��ϵͳ�Ļ���·����һ��������seajsͬһֵ
        base: '',

        // ����ϲ�ѹ�����css�ļ����ڵĻ���·��������ָ�����������׳����Ҳ����ļ�
        combobase: '',

        // Ϊtrueʱ����css��������base·������Ϊfalse������combocss·��������Ϊ�����Ͳ���&�����������л�����ʹ��
        debug: true,

        // ���ص�css�ı�������д��
        alias: {},

        // ���ڿ���ʱ��Ҫ�������ԣ�css��̬��Դ���׳��ֻ��棬����ͨ��map���������汾���ƣ��������ʱ�����map: ['.css', '.css?v=' + new Date().getTime()]
        map: [],

        // proload
        proload: [],

        /**
         * ������ʼ�����ã�������ö����ϲ�
         * @param   {object}    conf    ��seacss��Ӧ���ĸ����Ե����ö���
         */
        config: function(conf){
            // ����base��Ĭ��Ϊseacss����Ŀ¼·��
            if(conf.base){
                seacss.base = conf.base;
                seacss.base.lastIndexOf('/') === seacss.base.length - 1 ? null : seacss.base += '/';
            }else if(seacss.base === ''){
                seacss.base = getBaseUrl();
            }

            // ����combobase��ͬbase
            if(conf.combobase){
                seacss.combobase = conf.combobase;
                seacss.combobase.lastIndexOf('/') === seacss.combobase.length - 1 ? null : seacss.combobase += '/';
            }else if(seacss.combobase === ''){
                seacss.combobase = seacss.base;
            }

            // ����debug
            typeof conf.debug === 'boolean' ? seacss.debug = conf.debug : null;

            // ����alias
            extend(seacss.alias, conf.alias);

            // ����proload
            extendArray(seacss.proload, conf.preload);

            // ����map
            typeof conf.map === 'object' && conf.map instanceof Array ? seacss.map = conf.map : null;

            // ��س�ʼ����Ŀǰֻ��alias�ĳ�ʼ��
            init();
        },


        /**
         * ����css
         * @param   {string|array}  paths   �����css·��
         * paths�����ݽṹ���£�
         * "xx1.css" or ["xx1.css", "xx2.css"] or ["xx1.css", ["combo1.css", "combo2.css"], ["c1.css", "c2.css"]]
         */
        use: function(paths){
            if(typeof paths !== 'string' && !(paths instanceof Array)){
                return;
            }

            // preload
            if(seacss.proload.length > 0){
                var tmp = [];
                extendArray(tmp, seacss.proload);
                seacss.proload = [];
                for(var i = 0,l = tmp.length;i < l;i++){
                    seacss.use(tmp[i]);
                }
            }

            // head��ǩ
            var headNode = document.head;

            if(typeof paths === 'string'){
                // ������ַ���������Ҫ�ж��Ƿ�ʹ��combo
                loadSrcLink(paths);
            }else if(paths instanceof Array){
                for(var i = 0,l = paths.length;i < l;i++){
                    if(typeof paths[i] === 'string'){
                        // ������ַ���������Ҫ�ж��Ƿ�ʹ��combo
                        loadSrcLink(paths[i]);
                    }else{
                        // �����Ƿ�ʹ��debug�����ļ�������ϲ���·�������ļ�������
                        if(seacss.debug){
                            for(var n = 0,m = paths[i].length;n < m;n++){
                                loadSrcLink(paths[i][n]);
                            }
                        }else{
                            // ·��ƴ��Ϊ: app/xx1&xx2&xx3.css
                            loadSrcLink(seacss.combobase + paths[i].join('&') + '.css')
                        }
                    }
                }
            }else{
                throw("Paramters type is error!");
            }


            function loadSrcLink(path){
                // ���ּ������
                // 1�������"."��"/"��"http(s):"��ͷ����ӵ�__srclist
                // 2�������alias���ȫurl
                // 3�������1��2���������ֱ��������ӵ�__srclist
                if(/^\.|^\/|http[s]*:|file:/.test(path) && !__srclist[path]){
                    __srclist[path] = true;
                    headNode.appendChild(loadLink({url: path}));
                }else if(path in __aliaslist){
                    if(!__aliaslist[path].used){
                        __aliaslist[path].used = true;
                        /^\.|^\/|http[s]*:|file:/.test(__aliaslist[path].url) ? headNode.appendChild(loadLink(__aliaslist[path])) : headNode.appendChild(loadLink({url: seacss.base + __aliaslist[path].url, attrs: __aliaslist[path].attrs}))
                    }
                }else{
                    if(!__srclist[path]){
                        __srclist[path] = true;
                        path.indexOf(seacss.combobase) > -1 ? headNode.appendChild(loadLink({url: seacss.combobase + path})) : headNode.appendChild(loadLink({url: seacss.base + path}));
                    }
                }
            }
        }
    };

    // Private attributes
    var __srclist = {};
    var __aliaslist = {};
    var __base = null;


    /**
     * ====================
     * Private functions
     * :start
     * ====================
     */

    /**
     * alias�ĳ�ʼ��
     */
    function init(){
        if(seacss.alias){
            for(var itm in seacss.alias){
                // if it's just a string type
                if(typeof seacss.alias[itm] === 'string'){
                    __aliaslist[itm] = {
                        url: seacss.alias[itm],
                        used: false
                    }
                }else{  // object setting
                    __aliaslist[itm] = {
                        url: seacss.alias[itm].url,
                        attrs: seacss.alias[itm].attrs,
                        used: false
                    }
                }
            }
        }
    }


    /**
    * ��ȡ��ǰseacss.js����Ŀ¼·��
    */
    function getBaseUrl(){
        if(!__base){
            var scripts = document.scripts;
            for(var i = 0,l = scripts.length;i < l;i++){
                if(scripts[i].src.indexOf('seacss.js') > 0){
                    __base = scripts[i].src.substring(0, scripts[i].src.lastIndexOf('/'));
                    break;
                }
            }
        }
        return __base;
    }


    /**
    * ����css
    * @param   {object}    link    ��Ҫ���ص�css���������ݽṹ��
    * {
    *      url: 'app/xxx/xxx.js',
    *      attrs: {
    *          'media': '',
    *          'hreflang': 'utf-8',
    *          'charset': 'utf-8'
    *      }
    * }
    */
    function loadLink(link){
        var tmp = document.createElement('link');
        tmp.setAttribute("rel", "stylesheet");
        tmp.setAttribute("type", "text/css");
        tmp.setAttribute("href", mapCss(link.url));
        if(link.attrs){
            for(var itm in link.attrs){
                tmp.setAttribute(itm, link.attrs[itm]);
            }
        }
        return tmp;
    }


    /**
    * ���������滻�����css·��
    * @param   {string}    url      ��Ҫ�滻��Դ·��
    * @return  {string}    �滻���css·��
    * @desc
    * seacss.map��Ҫ�����������ݽṹ
    * [['.css', '.css?v=1.0'], [/.css$/, '.css?v=1.0'], ...]
    */
    function mapCss(url){
        var map = seacss.map;
        if(map && map instanceof Array){
            for(var i = 0,l = map.length;i < l;i++){
                url = url.replace(map[i][0], map[i][1]);
            }
        }
        return url;
    }


    /**
    * ��չ��������ֵ
    * @param   {object}    src     ��Ҫ��չ�Ķ���
    * @param   {object}    exts    ��չ�����Զ���
    */
    function extend(src, exts){
        if(!exts){
            return;
        }
        for(var itm in exts){
            src[itm] = exts[itm];
        }
    }


    /**
    * ��չ����ֵ
    * @param   {array}    src     ��Ҫ��չ�Ķ���
    * @param   {array}    exts    ��չ�����Զ���
    */
    function extendArray(src, exts){
        if(!exts || !(exts instanceof Array)){
            return;
        }
        var tmp = {};
        for(var i = 0, l = src.length;i < l;i++){
            tmp[src[i]] = 1;
        }
        for(i = 0,l = exts.length;i < l;i++){
            if(!(exts[i] in tmp)){
                src.push(exts[i]);
                tmp[exts[i]] = 1;
            }
        }
    }

    /**
    * ====================
    * :end
    * Private functions
    * ====================
    */

    window.seacss ? null : window.seacss = seacss;
})(window);