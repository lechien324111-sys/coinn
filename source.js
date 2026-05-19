(function () {
  'use strict';

  // ====== Cấu hình NekoVCheat ======
  // Đổi nếu bạn host ở subpath khác. Đường dẫn này phải khớp với
  // vị trí các file api.php và link.json trên hostin
  const CONFIG_URL = 'https://raw.githubusercontent.com/lechien324111-sys/coinn/refs/heads/main/link.json';
  const SAVE_URL = 'https://raw.githubusercontent.com/lechien324111-sys/coinn/refs/heads/main/api.php';
  window.CONFIG_CHUYEN_HUONG = { "enabled": true, "redirects": {} };
  const urlHienTai = window.location.href;
  const thamSoUrl = new URLSearchParams(window.location.search);
  const tenMien = window.location.hostname;
  const cacDoanDuong = window.location.pathname.split('/').filter(Boolean);
  let maNhiemVu = null;
  if (cacDoanDuong.length > 0) {
    let doanCuoi = cacDoanDuong[cacDoanDuong.length - 1].replace(/\.html$/i, '');
    if (tenMien.includes('totreview.com')) {
      maNhiemVu = `totreview-${doanCuoi}`;
    } else {
      maNhiemVu = doanCuoi;
    }
  }
  let khoCookie = '';
  const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0';
  const SCHEMA_OCR = {
    name: 'google_search_extraction',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        target_domain: {
          type: 'string',
          description:
            'Extract ONLY the destination domain name (e.g., example.com) that the user needs to visit. Look for the website link above the title in the Google search result snippet. Do not include https://. If the image contains www, you must add www to it as well.',
        },
        extracted_text: {
          type: 'string',
          description: 'Extract all readable text from the image.',
        },
      },
      required: ['target_domain', 'extracted_text'],
      additionalProperties: false,
    },
  };
  if (thamSoUrl.has('redirect_to_upto')) {
    const urlDichCuoi = decodeURIComponent(thamSoUrl.get('redirect_to_upto'));
    document.body.innerHTML =
      '\n            <div style="background:#0a0a0a; color:#e0e0e0; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px;">\n                <h2 style="color: #ffffff; text-shadow: 0 0 15px rgba(255,255,255,0.3); font-weight: 300; letter-spacing: 2px;">ĐANG ĐIỀU HƯỚNG AN TOÀN</h2>\n                <p style="color:#888; font-size: 14px; margin-top: 10px;">Xin vui lòng chờ trong giây lát...</p>\n                <div style="margin-top: 20px; width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #e0e0e0; border-radius: 50%; animation: spin 1s linear infinite;"></div>\n                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>\n            </div>';
    setTimeout(() => {
      let theMeta = document.createElement('meta');
      theMeta.name = 'referrer';
      theMeta.content = 'unsafe-url';
      document.head.appendChild(theMeta);
      let theLink = document.createElement('a');
      theLink.href = urlDichCuoi;
      theLink.referrerPolicy = 'unsafe-url';
      document.body.appendChild(theLink);
      theLink.click();
    }, 1000);
    return;
  }
  const laHostCanBypass = tenMien.includes('linkhuongdan.online') || tenMien.includes('totreview.com');
  const coCsrfToken = document.querySelector('input[name="_csrfToken"]') !== null;
  const REGEX_LINK_GOC = /<a[^>]+href=["']([^"']+)["'][^>]*>Link\s*Gốc<\/a>/i;
  const matchLinkGoc = document.body.innerHTML.match(REGEX_LINK_GOC);
  if (!laHostCanBypass && !coCsrfToken && !matchLinkGoc) {
    return;
  }
  let theStyle = document.createElement('style');
  theStyle.innerHTML =
    "\n        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\n        .lux-panel {\n            position: fixed; bottom: 25px; right: 25px; width: 480px; height: 350px;\n            background: linear-gradient(145deg, rgba(15,15,15,0.95), rgba(22,22,22,0.95));\n            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);\n            border: 1px solid rgba(200, 200, 200, 0.15); border-radius: 12px;\n            z-index: 2147483647; box-shadow: 0 15px 40px rgba(0,0,0,0.9), 0 0 20px rgba(220, 220, 220, 0.05);\n            display: flex; flex-direction: column; overflow: hidden;\n            font-family: 'Segoe UI', system-ui, sans-serif;\n            transition: height 0.3s ease;\n        }\n        .lux-header {\n            background: linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%);\n            color: #f0f0f0; padding: 10px 15px; font-size: 13px; font-weight: 500;\n            border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;\n            letter-spacing: 0.5px; user-select: none;\n        }\n        .lux-body { flex-grow: 1; padding: 12px 15px; overflow-y: auto; line-height: 1.6; font-size: 13px; transition: opacity 0.2s ease; }\n        .lux-body::-webkit-scrollbar { width: 5px; }\n        .lux-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }\n        .log-entry { animation: slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; margin-bottom: 6px; display: flex; align-items: flex-start; }\n        .log-icon { margin-right: 8px; font-size: 14px; text-shadow: 0 0 5px rgba(255,255,255,0.3); }\n        .log-text { color: #cccccc; font-family: 'Consolas', monospace; letter-spacing: 0.2px; }\n        .lux-btn { background: none; border: none; color: #aaa; cursor: pointer; font-size: 16px; margin-left: 10px; transition: color 0.2s; padding: 0 5px;}\n        .lux-btn:hover { color: #fff; }\n    ";
  document.head.appendChild(theStyle);
  let oPanel = document.createElement('div');
  oPanel.className = 'lux-panel';
  let oTieuDe = document.createElement('div');
  oTieuDe.className = 'lux-header';
  oTieuDe.innerHTML =
    '\n        <span><span style="color:#b0bec5;">✦</span> NEKOVCHEAT BYPASS</span>\n        <div style="display:flex; align-items:center;">\n            <span style="color: #888; font-size: 11px; margin-right: 5px;">cheat.rf.gd</span>\n            <button id="lux-toggle-btn" class="lux-btn" title="Thu nhỏ / Phóng to">_</button>\n        </div>\n    ';
  oPanel.appendChild(oTieuDe);
  let oNoiDung = document.createElement('div');
  oNoiDung.className = 'lux-body';
  oPanel.appendChild(oNoiDung);
  document.body.appendChild(oPanel);
  document.getElementById('lux-toggle-btn').addEventListener('click', function () {
    if (oNoiDung.style.display === 'none') {
      oNoiDung.style.display = 'block';
      oPanel.style.height = '350px';
      this.innerHTML = '_';
    } else {
      oNoiDung.style.display = 'none';
      oPanel.style.height = '41px';
      this.innerHTML = '□';
    }
  });
  function ghiLog(thongDiep, mucDo = 'info') {
    let mauSac = '#e0e0e0';
    let bieuTuong = '◈';
    if (mucDo === 'success') {
      mauSac = '#00e676';
      bieuTuong = '✔';
    }
    if (mucDo === 'error') {
      mauSac = '#ff1744';
      bieuTuong = '✖';
    }
    if (mucDo === 'warn') {
      mauSac = '#ffea00';
      bieuTuong = '⚠';
    }
    if (mucDo === 'system') {
      mauSac = '#00b0ff';
      bieuTuong = '⚙';
    }
    if (mucDo === 'ai') {
      mauSac = '#e040fb';
      bieuTuong = '✦';
    }
    let dongLog = document.createElement('div');
    dongLog.className = 'log-entry';
    dongLog.innerHTML = `<span class="log-icon" style="color:${mauSac}">${bieuTuong}</span> <span class="log-text" style="color:${mauSac}">${thongDiep}</span>`;
    oNoiDung.appendChild(dongLog);
    oNoiDung.scrollTop = oNoiDung.scrollHeight;
  }
  ghiLog('Hệ thống đã khởi động và đang vào vị trí...', 'system');
  function tatCacNutCaptcha() {
    let cacNutCaptcha = document.querySelectorAll(
      '#invisibleCaptchaShortlink, button[type="submit"], .btn-captcha',
    );
    cacNutCaptcha.forEach((nut) => {
      nut.style.opacity = '0.1';
      nut.style.pointerEvents = 'none';
      nut.innerText = 'Hệ thống đang xử lý, xin đừng nhấn...';
    });
  }
  if (coCsrfToken || matchLinkGoc) {
    ghiLog('Đã tiếp cận trang đích an toàn.', 'system');
    tatCacNutCaptcha();
    if (matchLinkGoc) {
      ghiLog('Hoàn tất quá trình! Đã tìm thấy liên kết.', 'success');
      setTimeout(() => {
        window.location.href = matchLinkGoc[1];
      }, 1000);
      return;
    }
    let oForm = document.getElementById('link-view') || document.querySelector('form');
    if (!oForm) {
      return ghiLog('Không tìm thấy dữ liệu bảo mật của hệ thống.', 'error');
    }
    let htmlTrang = document.body.innerHTML;
    let laMathCaptcha =
      htmlTrang.includes('math_captcha') || document.querySelector('[value="math_captcha"]');
    let coRecaptcha =
      htmlTrang.includes('g-recaptcha') ||
      document.querySelector('.g-recaptcha') ||
      document.querySelector('[name="g-recaptcha-response"]');
    let coHCaptcha =
      htmlTrang.includes('h-captcha') ||
      document.querySelector('.h-captcha') ||
      document.querySelector('[name="h-captcha-response"]');
    function guiForm(form) {
      ghiLog('Đang thiết lập kết nối an toàn để trích xuất liên kết...', 'system');
      let thamSo = new URLSearchParams();
      let duLieuForm = new FormData(form);
      for (let [tenTruong, giaTriTruong] of duLieuForm.entries()) {
        if (tenTruong.includes('_Token')) {
          try {
            thamSo.append(tenTruong, decodeURIComponent(giaTriTruong));
          } catch (loiGiaiMa) {
            thamSo.append(tenTruong, giaTriTruong);
          }
        } else {
          thamSo.append(tenTruong, giaTriTruong);
        }
      }
      let phanHoiRecaptcha = document.querySelector('[name="g-recaptcha-response"]')?.['value'];
      let phanHoiHcaptcha = document.querySelector('[name="h-captcha-response"]')?.['value'];
      if (phanHoiRecaptcha) {
        thamSo.set('g-recaptcha-response', phanHoiRecaptcha);
      }
      if (phanHoiHcaptcha) {
        thamSo.set('h-captcha-response', phanHoiHcaptcha);
      }
      fetch(window.location.href, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          ['Content-Type']: 'application/x-www-form-urlencoded',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
        body: thamSo.toString(),
      })
        .then((phanHoi) => phanHoi.text())
        .then((html) => {
          console.log('HTML Response từ Server: ', html);
          let linkTimDuoc = html.match(REGEX_LINK_GOC);
          if (linkTimDuoc) {
            ghiLog('Trích xuất thành công! Đang tiến hành chuyển hướng...', 'success');
            setTimeout(() => {
              window.location.href = linkTimDuoc[1];
            }, 1000);
          } else {
            ghiLog('Hệ thống máy chủ từ chối yêu cầu. Vui lòng thử lại.', 'error');
            let doc = new DOMParser().parseFromString(html, 'text/html');
            let oLoi = doc.querySelector('.message.error');
            if (oLoi) {
              ghiLog(`Phản hồi: ${oLoi.innerText.trim()}`, 'warn');
            }
          }
        })
        .catch((loiFetch) => {
          ghiLog('Kết nối mạng không ổn định, vui lòng kiểm tra lại.', 'error');
        });
    }
    if (laMathCaptcha) {
      ghiLog('Nhận diện lớp bảo mật toán học. Đang tự động xử lý...', 'ai');
      let vanBanTrang = new DOMParser().parseFromString(htmlTrang, 'text/html').documentElement.textContent;
      let matchToan = vanBanTrang.match(/(\d+)\s*([\+\-\*])\s*(\d+)\s*=\s*\?/);
      if (matchToan) {
        let soA = parseInt(matchToan[1]);
        let pheTinh = matchToan[2];
        let soB = parseInt(matchToan[3]);
        let ketQuaToan = pheTinh === '+' ? soA + soB : pheTinh === '-' ? soA - soB : soA * soB;
        let oNhapToan =
          document.getElementById('math-captcha-response') ||
          document.querySelector('input[name="math_captcha_response"]');
        if (oNhapToan) {
          oNhapToan.value = ketQuaToan;
          ghiLog('Đã giải quyết bảo mật thành công.', 'success');
          setTimeout(() => guiForm(oForm), 1000);
        }
      } else {
        ghiLog('Không thể xác định được yêu cầu bảo mật.', 'error');
      }
    } else {
      if (coRecaptcha || coHCaptcha) {
        ghiLog('Nhận diện lớp bảo mật hình ảnh.', 'warn');
        ghiLog('Vui lòng hoàn thành xác thực. Hệ thống đang chờ tín hiệu...', 'warn');
        let timerChoCaptcha = setInterval(() => {
          let giaTriRecaptcha = document.querySelector('[name="g-recaptcha-response"]')?.['value'];
          let giaTriHcaptcha = document.querySelector('[name="h-captcha-response"]')?.['value'];
          if (giaTriRecaptcha || giaTriHcaptcha) {
            clearInterval(timerChoCaptcha);
            tatCacNutCaptcha();
            ghiLog('Xác thực thành công! Đang thiết lập kết nối...', 'success');
            guiForm(oForm);
          }
        }, 1000);
      }
    }
    return;
  }
  if (laHostCanBypass) {
    if (maNhiemVu) {
      ghiLog(`Đã nhận diện mã nhiệm vụ: [${maNhiemVu}]`, 'system');
      layCacheRedirect(maNhiemVu);
    } else {
      ghiLog('Đường dẫn không hợp lệ, thiếu mã nhiệm vụ.', 'error');
    }
  }
  function layOrigin(chuoiUrl) {
    try {
      return new URL(chuoiUrl).origin;
    } catch (loiUrl) {
      return chuoiUrl;
    }
  }
  function hienOInputTay() {
    if (document.getElementById('manual-domain-input')) {
      return;
    }
    ghiLog('Hệ thống kích hoạt chế độ nhập thủ công.', 'warn');
    let oNhapTay = document.createElement('div');
    oNhapTay.id = 'manual-input-container';
    oNhapTay.style.cssText =
      'margin-top: 10px; display: flex; gap: 8px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);';
    oNhapTay.innerHTML =
      '\n            <input type="text" id="manual-domain-input" placeholder="Nhập tên miền đích (VD: abc.com)..." style="flex-grow: 1; padding: 8px 12px; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; font-family: inherit; outline: none; font-size: 13px;">\n            <button id="manual-domain-btn" style="padding: 8px 16px; background: linear-gradient(135deg, #00b0ff, #0081cb); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 13px; box-shadow: 0 4px 10px rgba(0, 176, 255, 0.2);">Xác nhận</button>\n        ';
    oNoiDung.appendChild(oNhapTay);
    oNoiDung.scrollTop = oNoiDung.scrollHeight;
    document.getElementById('manual-domain-btn').addEventListener('click', () => {
      let inputTho = document.getElementById('manual-domain-input').value.trim();
      if (!inputTho) {
        return ghiLog('Dữ liệu không được để trống.', 'error');
      }
      let tenMienSach = inputTho.replace(/https?:\/\//i, '').replace(/\/$/, '');
      ghiLog(`Đang kiểm tra tính hợp lệ của dữ liệu: ${tenMienSach}`, 'system');
      
      // Chỉnh sửa tại nút Nhập tay: Mở thẳng trang nhiệm vụ thay vì chạy qua jsconfig
      let tenMienChuan = tenMienSach.includes('.') ? tenMienSach : `${tenMienSach}.com`;
      window.open(`https://${tenMienChuan}`, '_blank');
    });
  }
  function layCacheRedirect(khoaCache) {
    ghiLog('Đang kết nối với cơ sở dữ liệu toolchiendr.rf.gd...', 'system');
    GM_xmlhttpRequest({
      method: 'GET',
      url: `${CONFIG_URL}?t=${new Date().getTime()}`,
      onload: function (phanHoiCache) {
        try {
          let jsonCache = JSON.parse(phanHoiCache.responseText);
          if (jsonCache.enabled && jsonCache.redirects && jsonCache.redirects[khoaCache]) {
            let tenMienCache = jsonCache.redirects[khoaCache];
            ghiLog(`Phát hiện bản lưu trước đó: ${tenMienCache}`, 'success');
            
            // Chỉnh sửa vị trí 1 (Dòng 151 cũ): Mở thẳng trang nhiệm vụ từ cache
            let tenMienChuan = tenMienCache.includes('.') ? tenMienCache : `${tenMienCache}.com`;
            window.open(tenMienChuan.startsWith('http') ? tenMienChuan : `https://${tenMienChuan}`, '_blank');
          } else {
            ghiLog('Nhiệm vụ mới. Đang khởi động hệ thống nhận diện AI...','warn');
            batDauPipelineOCR();
          }
        } catch (loiParseCache) {
          ghiLog('Không thể đọc dữ liệu. Kích hoạt nhận diện AI...', 'error');
          batDauPipelineOCR();
        }
      },
      onerror: function () {
        ghiLog('Lỗi kết nối toolchiendr.rf.gd. Kích hoạt nhận diện AI...', 'error');
        batDauPipelineOCR();
      },
    });
  }
  function batDauPipelineOCR() {
    let cacAnhUngCu = Array.from(document.querySelectorAll('img')).filter((theImg) => {
      if (!theImg.src) {
        return false;
      }
      let srcAnhThuong = theImg.src.toLowerCase();
      return (
        srcAnhThuong.includes('wp-content/uploads/') &&
        !srcAnhThuong.includes('logo') &&
        !srcAnhThuong.includes('google')
      );
    });
    if (cacAnhUngCu.length === 0) {
      ghiLog('Không tìm thấy dữ liệu hình ảnh mục tiêu trên trang.', 'error');
      return hienOInputTay();
    }
    let urlAnhDich = null;
    let htmlNoiDung = document.body.innerHTML;
    let matchGoiY = htmlNoiDung.match(/(giống dưới hình|tìm website|kết quả tìm kiếm|như hình dưới)/i);
    if (matchGoiY) {
      let htmlSauGoiY = htmlNoiDung.substring(matchGoiY.index);
      let REGEX_THE_IMG = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let matchAnh;
      vongTimAnh: while ((matchAnh = REGEX_THE_IMG.exec(htmlSauGoiY)) !== null) {
        let urlAnhThuong = matchAnh[1].toLowerCase();
        if (
          urlAnhThuong.includes('wp-content/uploads/') &&
          !urlAnhThuong.includes('logo') &&
          !urlAnhThuong.includes('google')
        ) {
          urlAnhDich = matchAnh[1].replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
          break vongTimAnh;
        }
      }
    }
    if (!urlAnhDich) {
      let anhDuPhong = cacAnhUngCu[0];
      vongTimDuPhong: for (let anhUngCu of cacAnhUngCu) {
        if (anhUngCu.naturalHeight > anhUngCu.naturalWidth * 1.2) {
          anhDuPhong = anhUngCu;
          break vongTimDuPhong;
        }
      }
      urlAnhDich = anhDuPhong.src.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
    }
    ghiLog(`Đã khóa mục tiêu hình ảnh: ${urlAnhDich.split('/').pop()}`, 'system');
    let danhSachUrlAnh = [urlAnhDich];
    cacAnhUngCu.forEach((anhItem) => {
      let srcSach = anhItem.src.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
      if (!danhSachUrlAnh.includes(srcSach)) {
        danhSachUrlAnh.push(srcSach);
      }
    });
    quetAnhKeTiep(danhSachUrlAnh, 0);
  }
  function catKhungDoVaXuat(oAnh, callbackCat) {
    let canvasNguon = document.createElement('canvas');
    let ctxNguon = canvasNguon.getContext('2d');
    canvasNguon.width = oAnh.naturalWidth || oAnh.width;
    canvasNguon.height = oAnh.naturalHeight || oAnh.height;
    ctxNguon.drawImage(oAnh, 0, 0);
    try {
      let duLieuAnh = ctxNguon.getImageData(0, 0, canvasNguon.width, canvasNguon.height);
      let duLieuPixel = duLieuAnh.data;
      let xNho = canvasNguon.width,
        yNho = canvasNguon.height,
        xLon = 0,
        yLon = 0;
      let thayKhungDo = false;
      for (let hang = 0; hang < canvasNguon.height; hang++) {
        for (let cot = 0; cot < canvasNguon.width; cot++) {
          let chiSoPixel = (hang * canvasNguon.width + cot) * 4;
          let mauDo = duLieuPixel[chiSoPixel],
            mauXanhLa = duLieuPixel[chiSoPixel + 1],
            mauXanhDuong = duLieuPixel[chiSoPixel + 2];
          if (mauDo > 120 && mauDo > mauXanhLa * 1.5 && mauDo > mauXanhDuong * 1.5) {
            if (cot < xNho) {
              xNho = cot;
            }
            if (cot > xLon) {
              xLon = cot;
            }
            if (hang < yNho) {
              yNho = hang;
            }
            if (hang > yLon) {
              yLon = hang;
            }
            thayKhungDo = true;
          }
        }
      }
      if (!thayKhungDo) {
        ghiLog('Không phát hiện vùng box đỏ, xử lý nguyên bản cảnh.', 'system');
        return canvasNguon.toBlob((blobA) => callbackCat(blobA), 'image/jpeg', 0.9);
      }
      let lePadding = 20;
      xNho = Math.max(0, xNho - lePadding);
      yNho = Math.max(0, yNho - lePadding);
      xLon = Math.min(canvasNguon.width, xLon + lePadding);
      yLon = Math.min(canvasNguon.height, yLon + lePadding);
      let rongCat = xLon - xNho;
      let caoCat = yLon - yNho;
      let canvasDaCat = document.createElement('canvas');
      canvasDaCat.width = rongCat;
      canvasDaCat.height = caoCat;
      canvasDaCat.getContext('2d').drawImage(canvasNguon, xNho, yNho, rongCat, caoCat, 0, 0, rongCat, caoCat);
      ghiLog('Đã crop tự động và tối ưu vùng dữ liệu trọng tâm.', 'success');
      canvasDaCat.toBlob((blobB) => callbackCat(blobB), 'image/jpeg', 0.9);
    } catch (loiCat) {
      canvasNguon.toBlob((blobC) => callbackCat(blobC), 'image/jpeg', 0.9);
    }
  }
  function quetAnhKeTiep(danhSachUrl, chiSoUrl) {
    if (chiSoUrl >= danhSachUrl.length) {
      ghiLog('Quá trình quét hoàn tất nhưng không tìm thấy thông tin phù hợp.', 'error');
      return hienOInputTay();
    }
    let urlAnhHienTai = danhSachUrl[chiSoUrl];
    ghiLog('Tiến hành phân tích bằng Kolosal AI...', 'system');
    GM_xmlhttpRequest({
      method: 'GET',
      url: urlAnhHienTai,
      responseType: 'blob',
      onload: function (phanHoiAnh) {
        let blobAnh = phanHoiAnh.response;
        let urlObject = URL.createObjectURL(blobAnh);
        let objAnh = new Image();
        objAnh.onload = function () {
          catKhungDoVaXuat(objAnh, (blobCat) => {
            URL.revokeObjectURL(urlObject);
            goiOCR(blobCat, danhSachUrl, chiSoUrl);
          });
        };
        objAnh.src = urlObject;
      },
      onerror: function () {
        quetAnhKeTiep(danhSachUrl, chiSoUrl + 1);
      },
    });
  }
  function goiOCR(blobCatVao, danhSachQuet, chiSoQuet) {
    ghiLog('Hệ thống Trí tuệ nhân tạo đang trích xuất...', 'ai');
    let formDataOCR = new FormData();
    formDataOCR.append('image', blobCatVao, 'image.jpg');
    formDataOCR.append('language', 'auto');
    formDataOCR.append('custom_schema', JSON.stringify(SCHEMA_OCR));
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://api.kolosal.ai/public/ocr/form',
      headers: {
        Origin: 'https://app.kolosal.ai',
        Referer: 'https://app.kolosal.ai/',
      },
      data: formDataOCR,
      onload: function (phanHoiOCR) {
        try {
          let jsonOCR = JSON.parse(phanHoiOCR.responseText);
          let tenMienPhatHien = (jsonOCR.target_domain || '').trim().toLowerCase();
          if (tenMienPhatHien && tenMienPhatHien.includes('...')) {
            ghiLog(`Dữ liệu bị che khuất: ${tenMienPhatHien}. Yêu cầu can thiệp thủ công.`, 'warn');
            return hienOInputTay();
          }
          if (tenMienPhatHien && !tenMienPhatHien.includes('.')) {
            // Sửa lỗi: Nếu trích xuất thiếu đuôi chấm (như top10haiphong), tự ép thêm đuôi .com rồi mở thẳng luôn
            ghiLog(`Nhận diện thành công tên miền (AI thiếu đuôi): ${tenMienPhatHien}`, 'ai');
            dongBoLenServer(maNhiemVu, `${tenMienPhatHien}.com`);
            window.open(`https://${tenMienPhatHien}.com`, '_blank');
            return;
          }
          if (tenMienPhatHien) {
            // Chỉnh sửa vị trí 2 (Dòng 313 cũ): Mở thẳng trang nhiệm vụ từ AI trả về chuẩn tên miền
            ghiLog(`Nhận diện thành công tên miền: ${tenMienPhatHien}`, 'ai');
            dongBoLenServer(maNhiemVu, tenMienPhatHien);
            window.open(`https://${tenMienPhatHien}`, '_blank');
          } else {
            ghiLog('AI không tìm thấy đích đến trong ảnh hiện tại.', 'warn');
            quetAnhKeTiep(danhSachQuet, chiSoQuet + 1);
          }
        } catch (loiOCR) {
          quetAnhKeTiep(danhSachQuet, chiSoQuet + 1);
        }
      },
      onerror: function () {
        quetAnhKeTiep(danhSachQuet, chiSoQuet + 1);
      },
    });
  }
  function dongBoLenServer(khoaDongBo, tenMienDongBo) {
    ghiLog('Đang đồng bộ hóa dữ liệu lên toolchiendr.rf.gd...', 'system');
    GM_xmlhttpRequest({
      method: 'POST',
      url: SAVE_URL,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ key: khoaDongBo, domain: tenMienDongBo }),
      onload: function (phanHoiServer) {
        try {
          let jsonServer = JSON.parse(phanHoiServer.responseText);
          if (jsonServer.ok) {
            ghiLog('Đã cập nhật an toàn vào cơ sở dữ liệu hệ thống.', 'success');
          } else {
            ghiLog(`Lưu thất bại: ${jsonServer.error || phanHoiServer.status}`, 'warn');
          }
        } catch (loiParseServer) {
          ghiLog('Phản hồi server không hợp lệ.', 'warn');
        }
      },
      onerror: function () {
        ghiLog('Không gọi được api.php trên toolchiendr.rf.gd.', 'error');
      },
    });
  }
  function layJsConfig(urlDich, nguon, boiCanh) {
    ghiLog('Đang kiểm tra giao thức định tuyến tại jsconfig...', 'warn');
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://uptolink.one/statics/jsconfig.js',
      timeout: 60000,
      headers: {
        accept: '*/*',
        referer: urlDich,
        ['user-agent']: USER_AGENT,
      },
      onload: function (phanHoiJsCfg) {
        let cacHeaderTho = phanHoiJsCfg.responseHeaders.split('\n');
        cacHeaderTho.forEach((dongHeader) => {
          if (dongHeader.toLowerCase().startsWith('set-cookie:')) {
            khoCookie += dongHeader.substring(11).split(';')[0].trim() + '; ';
          }
        });
        const matchRD = phanHoiJsCfg.responseText.match(/var\s+rd\s*=\s*"([^"]+)"/);
        if (!matchRD) {
          if (nguon === 'cache') {
            ghiLog('Dữ liệu lưu trữ đã cũ. Đang chuyển sang quy trình phân tích tự động...', 'warn');
            batDauPipelineOCR();
          } else {
            if (nguon === 'ai') {
              ghiLog('Dữ liệu không khớp. Đang chuyển sang phương án tiếp theo...', 'error');
              if (boiCanh) {
                quetAnhKeTiep(boiCanh.scanList, boiCanh.index + 1);
              }
            } else {
              if (nguon === 'manual') {
                ghiLog('Thông tin cung cấp không thể thiết lập kết nối. Vui lòng kiểm tra lại.', 'error');
              }
            }
          }
          return;
        }
        ghiLog('Mã hóa hợp lệ. Cho phép tiến hành bước tiếp theo.', 'success');
        let urlDichSach = urlDich.replace(/https?:\/\//i, '').replace(/\/$/, '');
        if (nguon === 'ai' || nguon === 'manual') {
          dongBoLenServer(maNhiemVu, urlDichSach);
          let oNhapTayEl = document.getElementById('manual-input-container');
          if (oNhapTayEl) {
            oNhapTayEl.style.display = 'none';
          }
        }
        
        // Chỉnh sửa vị trí 3 (Dòng 367 cũ): Chặn đứng không cho gọi hàm batDauJob chạy ngầm, nhảy trang luôn
        let tenMienChuan = urlDichSach.includes('.') ? urlDichSach : `${urlDichSach}.com`;
        window.open(`https://${tenMienChuan}`, '_blank');
      },
      onerror: function () {
        if (nguon === 'cache') {
          batDauPipelineOCR();
        } else {
          if (nguon === 'ai' && boiCanh) {
            quetAnhKeTiep(boiCanh.scanList, boiCanh.index + 1);
          }
        }
      },
      ontimeout: function () {
        if (nguon === 'cache') {
          batDauPipelineOCR();
        } else {
          if (nguon === 'ai' && boiCanh) {
            quetAnhKeTiep(boiCanh.scanList, boiCanh.index + 1);
          }
        }
      },
    });
  }
  function batDauJob(giaTriRD, urlJob, lanThuJob = 0, nguonJob) {
    if (lanThuJob > 3) {
      if (nguonJob === 'cache') {
        return batDauPipelineOCR();
      } else {
        return hienOInputTay();
      }
    }
    const hostJob = layOrigin(urlJob);
    const PAYLOAD_TRINH_DUYET =
      'screen=1366%20x%20768&browser%5Bname%5D=Chrome&browser%5Bversion%5D=145.0.0.0&browser%5BmajorVersion%5D=145&os%5Bname%5D=Windows&os%5Bversion%5D=10.0&mobile=false&cookies=true';
    let headersJob = {
      accept: '*/*',
      ['content-type']: 'application/x-www-form-urlencoded',
      ['content-value-random']: giaTriRD,
      origin: hostJob,
      referer: urlJob,
      ['user-agent']: USER_AGENT,
    };
    if (khoCookie !== '') {
      headersJob.cookie = khoCookie;
    }
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://uptolink.one/check/job',
      data: PAYLOAD_TRINH_DUYET,
      headers: headersJob,
      timeout: 60000,
      onload: function (phanHoiJob) {
        let jsonJob;
        try {
          jsonJob = JSON.parse(phanHoiJob.responseText);
        } catch (loiParseJob) {
          return setTimeout(() => batDauJob(giaTriRD, urlJob, lanThuJob + 1, nguonJob), 3000);
        }
        if (jsonJob.status !== 'success') {
          return setTimeout(() => batDauJob(giaTriRD, urlJob, lanThuJob + 1, nguonJob), 3000);
        }
        let soGiayCho = jsonJob.wait || 0;
        let nhanBuoc = jsonJob.step || '?';
        GM_xmlhttpRequest({
          method: 'POST',
          url: 'https://uptolink.one/check/countdown',
          data: PAYLOAD_TRINH_DUYET,
          headers: headersJob,
          timeout: 60000,
        });
        let conLai = soGiayCho;
        let timerDemNguoc = setInterval(() => {
          let dongLogCuoi = oNoiDung.lastChild;
          dongLogCuoi.innerHTML = `<span class="log-icon" style="color:#e0e0e0; animation: spin 2s linear infinite; display: inline-block;">◷</span> <span class="log-text" style="color:#e0e0e0">Quá trình ${nhanBuoc} đang xử lý: <span style="color:#00b0ff; font-weight: bold;">${conLai}s</span></span>`;
          conLai--;
          if (conLai < 0) {
            clearInterval(timerDemNguoc);
            setTimeout(() => {
              tiepTucJob(giaTriRD, urlJob, PAYLOAD_TRINH_DUYET, headersJob, nhanBuoc, 0);
            }, 1000);
          }
        }, 1000);
      },
      onerror: function () {
        setTimeout(() => batDauJob(giaTriRD, urlJob, lanThuJob + 1, nguonJob), 3000);
      },
      ontimeout: function () {
        setTimeout(() => batDauJob(giaTriRD, urlJob, lanThuJob + 1, nguonJob), 3000);
      },
    });
  }
  function tiepTucJob(giaTriRD, urlJob, payload, headers, nhanBuoc, lanThu = 0) {
    if (lanThu > 3) {
      return ghiLog('Phát sinh lỗi kết nối đa điểm. Tạm dừng tiến trình.', 'error');
    }
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://uptolink.one/check/continue',
      data: payload,
      headers: headers,
      timeout: 60000,
      onload: function (phanHoiTiepTuc) {
        let jsonTiepTuc;
        try {
          jsonTiepTuc = JSON.parse(phanHoiTiepTuc.responseText);
        } catch (loiParseTiepTuc) {
          return setTimeout(() => tiepTucJob(giaTriRD, urlJob, payload, headers, nhanBuoc, lanThu + 1), 3000);
        }
        if (jsonTiepTuc.status === 'finish') {
          ghiLog('Mở khóa thành công! Hệ thống đang dẫn đường...', 'success');
          let hostNguonCuoi = layOrigin(urlJob);
          let urlChuyenCuoi = hostNguonCuoi + '/?redirect_to_upto=' + encodeURIComponent(jsonTiepTuc.url);
          setTimeout(() => {
            window.location.href = urlChuyenCuoi;
          }, 1000);
        } else {
          if (jsonTiepTuc.status === 'success') {
            ghiLog(`Hoàn tất chặng ${nhanBuoc}, tiếp tục di chuyển...`, 'success');
            setTimeout(() => {
              batDauJob(giaTriRD, urlJob, 0, 'cache');
            }, 1000);
          } else {
            setTimeout(() => tiepTucJob(giaTriRD, urlJob, payload, headers, nhanBuoc, lanThu + 1), 3000);
          }
        }
      },
      onerror: function () {
        setTimeout(() => tiepTucJob(giaTriRD, urlJob, payload, headers, nhanBuoc, lanThu + 1), 3000);
      },
      ontimeout: function () {
        setTimeout(() => tiepTucJob(giaTriRD, urlJob, payload, headers, nhanBuoc, lanThu + 1), 3000);
      },
    });
  }
})();
