# -*- coding: utf-8 -*-
import re
import time
from routers.utils import hash_sha1, hash_sha256
from routers.router_spider import Router


class XiaoMi7000(Router):

    def login(self):
        url = f'http://{self.ip}/cgi-bin/luci/web'
        self.headers = {
            "Connection": "keep-alive",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/90.0.4430.72 Safari/537.36"
        }
        r = self.session.get(url=url, headers=self.headers)
        r_data = r.text.replace('\r', '').replace('\n', '').replace('\t', '')
        key = re.compile('key:.*?\'(.*?)\',').findall(r_data)[0]
        device_id = re.compile('deviceId = \'(.*?)\';').findall(r_data)[0]

        init_info_url = f'http://{self.ip}/cgi-bin/luci/api/xqsystem/init_info'
        init_info_r = self.session.get(url=init_info_url, headers=self.headers)
        init_info_data = init_info_r.json()
        # {"code":0,"isSupportMesh":1,"secAcc":1,"inited":1,"connect":0,"modules":{"replacement_assistant":"1"},"hardware":"RC06","support160M":1,"language":"zh_cn","romversion":"1.0.111","countrycode":"CN","routerId":"5dddb********3c7c","id":"44********41","routername":"Xiaomi_C84F","showPrivacy":0,"displayName":"Xiaomi路由器7000","imei":"","moduleVersion":"","maccel":"1","model":"xiaomi.router.rc06","wifi_ap":1,"bound":0,"newEncryptMode":1,"isRedmi":0}
        hardware = init_info_data.get("hardware")
        rom_version = init_info_data.get("romversion")
        serial_number = init_info_data.get("id")
        router_name = init_info_data.get("routername")

        self.data = {
            "hardware": hardware,
            "rom_version": rom_version,
            "serial_number": serial_number,
            "router_name": router_name,
        }
        new_encrypt_mode = init_info_data.get("newEncryptMode")
        pwd = self.password
        nonce = f'0_{device_id}_{str(int(time.time()))}_962'
        if new_encrypt_mode and int(new_encrypt_mode) == 1:
            a = hash_sha256(pwd + key)
            pass_word = hash_sha256(nonce + a)
        else:
            a = hash_sha1(pwd + key)
            pass_word = hash_sha1(nonce + a)

        log_url = f'http://{self.ip}/cgi-bin/luci/api/xqsystem/login'
        data = {
            "username": "admin",
            "password": pass_word,
            "logtype": "2",
            "nonce": nonce
        }
        res = self.session.post(url=log_url, headers=self.headers, data=data)
        cookie = res.raw.headers.getlist('Set-Cookie')[0]
        self.headers["Cookies"] = cookie.split(';')[0]
        self.token = res.json()['token']
        self.path = res.json()['url']
        self.stok = re.compile(';stok=(.*?)/').findall(self.path)[0]

    def get_device_info(self):

        d_name = self.session.get(
            url=f'http://{self.ip}/cgi-bin/luci/;stok={self.stok}/web/home', headers=self.headers)
        d_name_html = d_name.text
        mapModel = {
            'R1D': '小米路由器',
            'R2D': '小米路由器2',
            'R3D': '小米路由器HD',
            'R1CM': '小米路由器MINI',
            'R1CL': '小米路由器青春版',
            'R3': '小米路由器3',
            'R3L': '小米路由器3C',
            'R3P': '小米路由器3 Pro',
            'R3A': '小米路由器3A',
            'R3G': '小米路由器3G',
            'R4': '小米路由器4',
            'R4C': '小米路由器4Q',
            'R4CM': '小米路由器4C',
            'D01': '小米路由器Mesh',
            'R4AC': '小米路由器4A',
            'R4A': '小米路由器4 v2',
            'R3Gv2': '小米路由器3G',
            'R2600': '小米路由器2600',
            'R2100': '小米路由器AC2100',
            'R1500': '小米路由器1500',
            'R3600': '小米AIoT路由器 AX3600',
            'R1800': '小米AIoT路由器 AX1800',
            'RA72': '小米路由器 AX6000',
            'RA80': '小米路由器 AX3000',
            'RA81': 'Redmi路由器 AX3000',
            'RB08': 'Xiaomi HomeWiFi',
            'RC01': 'Xiaomi万兆路由器',
            'RC06': 'Xiaomi路由器7000'
        }
        d_name_r = ''
        d_type = ''
        wan_mac = ''

        if re.compile('hardwareVersion.*?\'(.*?)\'').findall(d_name_html):
            d_name_r = mapModel[re.compile(
                'hardwareVersion.*?\'(.*?)\'').findall(d_name_html)[0]]
            d_type = re.compile(
                'hardwareVersion.*?\'(.*?)\'').findall(d_name_html)[0]
        if re.compile("""#routermac'\).text\('(.*?)'\);""").findall(d_name_html):
            wan_mac = re.compile(
                """#routermac'\).text\('(.*?)'\);""").findall(d_name_html)[0]
        index_url = f'http://{self.ip}/cgi-bin/luci/;stok={self.stok}/api/xqnetwork/pppoe_status'
        ip_r = self.session.get(url=index_url, headers=self.headers)
        # {'proto': 'dhcp', 'dns': ['192.168.1.3'], 'code': 0, 'status': 0, 'gw': '192.168.1.3', 'ip': {'mask': '255.255.255.0', 'address': '192.168.1.35'}}
        ip_r_data = ip_r.json()

        name_url = f'http://{self.ip}/cgi-bin/luci/;stok={self.stok}/api/xqnetwork/wifi_detail_all'
        name_r = self.session.get(url=name_url, headers=self.headers)
        # {'bsd': 0, 'info': [{'ifname': 'wl1', 'channelInfo': {'bandwidth': '0', 'bandList': [], 'channel': 10}, 'encryption': 'mixed-psk', 'bandwidth': '0', 'kickthreshold': '0', 'status': '1', 'mode': 'Master', 'txbf': '0', 'weakthreshold': '0', 'device': 'mt7603e.network1', 'hidden': 0, 'password': '12345678', 'channel': '0', 'txpwr': 'max', 'weakenable': '0', 'ssid': 'Xiaomi_52F5', 'signal': 0}, {'ifname': 'wl0', 'channelInfo': {'bandwidth': '0', 'bandList': [], 'channel': 149}, 'encryption': 'mixed-psk', 'bandwidth': '0', 'kickthreshold': '0', 'status': '1', 'mode': 'Master', 'txbf': '0', 'weakthreshold': '0', 'device': 'mt7612.network1', 'hidden': 0, 'password': '12345678', 'channel': '0', 'txpwr': 'max', 'weakenable': '0', 'ssid': 'Xiaomi_52F5_5G', 'signal': 0}], 'code': 0}
        name_r_data = name_r.json()

        # 序列号
        serial_number = ''
        if self.data.get("serial_number"):
            serial_number = self.data.get("serial_number")
        # 设备名称
        product_number = name_r_data["info"][0]["ssid"]
        run_time = ''
        # WAN网口
        wan_port = ''
        # 链接方式
        link_method = ip_r_data["proto"]
        pppoe_user = ''
        pppoe_pwd = ''
        if 'dhcp' not in link_method:
            pppoe_status = self.session.get(
                url=f'http://{self.ip}/cgi-bin/luci/;stok={self.stok}/api/xqnetwork/pppoe_status', headers=self.headers)
            pppoe_status_data = pppoe_status.json()
            pppoe_user = pppoe_status_data['pppoename']
            pppoe_pwd = pppoe_status_data['password']

        ip = ip_r_data["ip"]["address"]
        # 子网掩码
        mask = ip_r_data["ip"]["mask"]
        # 网关地址
        gateway = ip_r_data["gw"]
        # 主DNS地址
        main_dns = ip_r_data["dns"][0] if ip_r_data["dns"] else ''

        slave_dns = ''
        cfg_url = f'http://{self.ip}/cgi-bin/luci/;stok={self.stok}/api/misystem/status'
        cfg_res = self.session.get(url=cfg_url, headers=self.headers)
        # {'dev': [{'mac': '18:****:87', 'maxdownloadspeed': '30351', 'upload': '137281', 'upspeed': '0', 'downspeed': '0', 'online': '298', 'devname': 'DESKTOP-D6GLNBH', 'maxuploadspeed': '12451', 'download': '266417'}], 'code': 0, 'mem': {'usage': 0.38, 'total': '128MB', 'hz': '1200MHz', 'type': 'DDR3'}, 'temperature': 0, 'count': {'all': 1, 'online': 1}, 'hardware': {'mac': '64:64****:52:F5', 'platform': 'R4A', 'version': '2.28.65', 'channel': 'release', 'sn': '21894/22358114'}, 'upTime': '408.31', 'cpu': {'core': 4, 'hz': '880MHz', 'load': 0.0045}, 'wan': {'downspeed': '571', 'maxdownloadspeed': '34500', 'history': '1003,838,711,1146,206,732,1568,5676,0,195,154,154,725,121,537,321,1423,181,202,195,0,1691,364,346,0,1134,1331,1462,0,1137,365,730,228,569,154,0,1187,0,0,487,338,1261,627,617,1163,229,7392,235,142,918', 'devname': 'eth1', 'upload': '166582', 'upspeed': '347', 'maxuploadspeed': '12322', 'download': '484827'}}
        cfg_data = cfg_res.json()
        mac = cfg_data["hardware"]["mac"]
        device_info_base_data = {
            "device_name": d_name_r,
            "device_type": d_type,
            "serial_number": serial_number,
            "run_time": run_time,
            "connection_type": link_method,
            "wan_ip": "",
            "wan_mac": wan_mac,
            "lan_ip": "",
            "lan_mac": "",
            "ipv4_wan_ip": "",
            "ipv4_lan_ip": "",
            "ipv4_gateway": "",
            "ipv4_dns_server": "",
            "ipv6_wan_ip": "",
            "ipv6_lan_ip": "",
            "ipv6_gateway": "",
            "ipv6_dns_server": "",
            "ip": ip,
            "mac": mac,
            "gateway": gateway,
            "mask": mask,
            "dns_server": main_dns,
            "pppoe_user": pppoe_user,
            "pppoe_pwd": pppoe_pwd,
            "wifi2_ssid": name_r_data['info'][0]['ssid'],
            "wifi2_key": name_r_data['info'][0]['password'],
            "wifi5_ssid": name_r_data['info'][1]['ssid'],
            "wifi5_key": name_r_data['info'][1]['password'],
            "pin": "",
            "encryption_mode": name_r_data['info'][0]['encryption'],
        }
        return device_info_base_data

    def get_device_host_info(self):
        device_ulr = f'http://{self.ip}/cgi-bin/luci/;stok={self.stok}/api/misystem/devicelist'
        r = self.session.post(url=device_ulr, headers=self.headers)
        data = r.json()
        device_list = []
        for one_device in data["list"]:
            status = 1
            device_info = {
                "ip": one_device['ip'][0]['ip'],
                "mac": one_device['mac'],
                "name": one_device['name'],
                "on_line_status": status,
            }
            device_list.append(device_info)
        return device_list

xm=XiaoMi7000()
xm.