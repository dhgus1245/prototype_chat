const CryptoJS = require("./utils/crypto-js/index.js")

App({
  globalData: {
    openid: null, //위챗 openid
    uniqno: null,
    lat: null,
    lng: null,
    g: null,
    manuf: null,
    d_model: null,
    os: null,
    os_version: null,
    lang: null,
    app_gubun: 10,
    server_version: '04.08.00',
    tpmn_id: '',
    user_master_no: 0,
    user_country: null,
    server_gubun: 2, //내부:1, 아마존:2
    app_version: '2.1',
    aesKey: CryptoJS.enc.Hex.parse('6F7269717561636B717561636B707961736B30313133636B6E62383431363738'),
    aesUniqKey: CryptoJS.enc.Hex.parse('6162636465666768696A6B6C6D6E6F707172737475767778797A313233343536'),
    aesIv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000'),
    market: '12',
    URLConfig: require('./utils/URLConfig.js')
  },
  onLaunch: function() {
    const _self = this

    //앱언어설정
    var appLang = wx.getStorageSync('appLang')
    appLang = (appLang == '' ? 'zh' : appLang)
    wx.setStorageSync('appLang', appLang)
    _self.globalData.lang = appLang

    //로그인 유저 번호(자동 로그인 용도)
    var user_master_no = wx.getStorageSync('user_master_no')
    user_master_no = (user_master_no > 0 ? user_master_no : '0')
    wx.setStorageSync('user_master_no', user_master_no)
    _self.globalData.user_master_no = user_master_no

    //사용자 국가
    var user_country = wx.getStorageSync('user_country')
    wx.setStorageSync('user_country', user_country)
    _self.globalData.user_country = user_country

    //uniqno
    var uniqno = wx.getStorageSync('uniqno')
    wx.setStorageSync('uniqno', uniqno)
    _self.globalData.uniqno = uniqno

    //gps
    function getGPS() {
      return new Promise(function(resolve, reject) {
        wx.getLocation({
          type: 'wgs84',
          success(res) {
            _self.globalData.lat = res.latitude
            _self.globalData.lng = res.longitude
            _self.globalData.g = _self.gpsEncoding(res.latitude) + ',' + _self.gpsEncoding(res.longitude)

            resolve(res);
          },
          fail(err) {
            reject(err);
          }
        });
      });
    }

    //기기정보
    function getSystemInfo() {
      return new Promise(function(resolve, reject) {
        wx.getSystemInfo({
          success(res) {
            _self.globalData.manuf = res.brand
            _self.globalData.d_model = res.model
            _self.globalData.os_version = res.system
            if (res.platform.toLowerCase().indexOf('ios') > -1) {
              _self.globalData.os = 2
            } else {
              _self.globalData.os = 1
            }
            resolve(res);
          },
          fail(err) {
            reject(err);
          }
        });
      });
    }

    //앱실행 정보
    function appExecute() {
      wx.request({
        url: _self.globalData.URLConfig.appExecute,
        data: {
          d_model: _self.globalData.d_model,
          manuf: _self.globalData.manuf,
          g: _self.globalData.lat + ',' + _self.globalData.lng,
          os_version: _self.globalData.os_version,
          uniqno: _self.globalData.uniqno,
          server_version: _self.globalData.server_version,
          lang: _self.globalData.lang,
          type: _self.globalData.os,
          app_gubun: _self.globalData.app_gubun,
          app_version: _self.globalData.app_version,
          market: _self.globalData.market,
        },
        method: "get",
        dataType: "json",
        success(res) {

        },
        fail(app_exe_err) {
          console.log('app_exe_err', app_exe_err)
        }
      })
    }

    function getCode() {
      return new Promise(function(resolve, reject) {
        wx.login({
          success: res => {
            if (res.code != undefined) {
              resolve(res);
            } else {
              reject(res);  
            }
          },
          fail(e) {
            reject(e);
          }
        });
      });
    }

    function getOpenid(code) {
      return new Promise(function(resolve, reject) {
        wx.request({
          url: _self.globalData.URLConfig.getopenid,
          data: {
            js_code: code
          },
          method: "get",
          dataType: "json",
          success(res) {
            if (res.data.openid != undefined) {
              _self.globalData.openid = res.data.openid;
              _self.globalData.uniqno = CryptoJS.MD5(res.data.openid).toString();
              wx.setStorageSync('uniqno', _self.globalData.uniqno)
              resolve(res);
            } else {
              reject(res);
            }
          },
          fail(e) {
            reject(e);
          }
        });
      });
    }

    function insertAppUser() {
      wx.request({
        url: _self.globalData.URLConfig.insertAppUser,
        data: {
          gen: _self.globalParam()
        },
        method: "get",
        dataType: "json",
        success(res) {

        }
      });
    }

    getSystemInfo().then(function(res) {
      return getCode()
    }).then(function(res) {
      return getOpenid(res.code)
    }).then(function() {
      insertAppUser();

      return getGPS();
    }).then(function() {
      appExecute()
    }).catch(function(e) {
      console.log(e);
    });
  },
  aesEnc(str) {
    var encryptedData = CryptoJS.AES.encrypt(str, this.globalData.aesKey, {
      mode: CryptoJS.mode.CBC,
      iv: this.globalData.aesIv
    })
    return encryptedData.toString()
  },
  aesUniqEnc(str) {
    var encryptedData = CryptoJS.AES.encrypt(str, this.globalData.aesUniqKey, {
      mode: CryptoJS.mode.CBC,
      iv: this.globalData.aesIv
    })
    return encryptedData.toString()
  },
  gpsEncoding(p_str) {
    p_str = p_str.toString()

    let text1 = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "@", "_", "-", "."
    ]
    let text2 = [
      "z", "y", "x", "w", "v", "u", "t", "s", "r", "q", "p", "o", "n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b", "a", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0", ".", "-", "_", "@"
    ]

    let l_result = "";
    let l_resultTemp = "";

    for (let i = 0; i < p_str.length; i++) {
      l_resultTemp = p_str.substring(i, i + 1);
      for (let j = 0; j < text1.length; j++) {
        let x = text1[j];
        if (l_resultTemp == x) {
          l_result = l_result + text2[j];
          j = text1.length;
        }
      }
    }
    return l_result;
  },
  globalParam(str) {
    let param = (str != undefined ? (str.length > 0 ? (str + '&') : '') : '')

    param += 'lang=' + this.globalData.lang
    param += '&g1=' + this.globalData.lat
    param += '&g2=' + this.globalData.lng
    param += '&g=' + this.globalData.g
    param += '&type=' + this.globalData.os
    param += '&os_version=' + this.globalData.os_version
    param += '&manuf=' + this.globalData.manuf
    param += '&d_model=' + this.globalData.d_model
    param += '&device_model=' + this.globalData.d_model
    param += '&app_gubun=' + this.globalData.app_gubun
    param += '&server_gubun=' + this.globalData.server_gubun
    param += '&version=' + this.globalData.server_version
    param += '&server_version=' + this.globalData.server_version
    param += '&app_version=' + this.globalData.app_version
    param += '&user_country=' + this.globalData.user_country
    param += '&user_master_no=' + this.globalData.user_master_no
    param += '&user_no=' + this.globalData.user_master_no
    param += '&uniqno=' + this.globalData.uniqno
    param += '&uniq=' + this.globalData.os + "_" + this.aesUniqEnc(this.globalData.uniqno)
    param += '&market=' + this.globalData.market
    param += '&os=' + this.globalData.os

    return this.aesEnc(param)
  }
})