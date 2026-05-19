(function () {
  'use strict';

  // ====== Cấu hình NekoVCheat ======
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
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const SCHEMA_OCR = {
    name: 'google_search_extraction',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        target_domain: {
          type: 'string',
          description: 'Extract ONLY the destination domain name (e.g., example.com) that the user needs to visit.',
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

  // Hàm phụ trợ tự động định dạng và mở tab mới chuẩn URL
  function chuyenHuongDenTrangNhiemVu(hostTarget) {
    let urlDich = hostTarget.includes('.') ? `https://${hostTarget}` : `https://www.google.com/search?q=${encodeURIComponent(hostTarget)}`;
    ghiLog(`Đang mở trang nhiệm vụ trong Tab mới: ${hostTarget}`, 'success');
    window.open(urlDich, '_blank');
  }

  if (thamSoUrl.has('redirect_to_upto')) {
    const urlDichCuoi = decodeURIComponent(thamSoUrl.get('redirect_to_upto'));
    document.body.innerHTML = '<div style="background:#0a0a0a; color:#e0e0e0; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; font-size: 20px;"><h2>ĐANG ĐIỀU HƯỚNG NHIỆM VỤ</h2><p style="color:#888; font-size: 14px; margin-top: 10px;">Vui lòng đợi giây lát...</p></div>';
    setTimeout(() => {
      window.location.href = urlDichCuoi;
    }, 1000);
    return;
  }

  // Khởi tạo menu bảo vệ (Né lỗi CSP của Quetta)
  let oHost = document.createElement('div');
  oHost.id = 'lux-host-container';
  Object.assign(oHost.style, { position: 'fixed', bottom: '25px', right: '25px', zIndex: '2147483647' });
  (document.body || document.documentElement).appendChild(oHost);
  let shadow = oHost.attachShadow({ mode: 'open' });

  let oPanel = document.createElement('div');
  Object.assign(oPanel.style, {
    width: '420px', height: '260px', background: 'rgba(15,15,15,0.98)',
    border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 15px 40px rgba(0,0,0,0.9)', fontFamily: 'system-ui, sans-serif'
  });

  oPanel.innerHTML = `
    <div style="background:#121212; color:#f0f0f0; padding:10px 15px; font-size:13px; font-weight:bold; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
        <span>✦ NEKOVCHEAT BYPASS CONTROLLER</span>
    </div>
    <div id="lux-content" style="flex-grow:1; padding:12px 15px; overflow-y:auto; font-size:12px; background:#0a0a0a;"></div>
  `;
  shadow.appendChild(oPanel);
  let oNoiDung = shadow.getElementById('lux-content');

  function ghiLog(text, type = 'info') {
    let color = '#00b0ff';
    if (type === 'success') color = '#00e676';
    if (type === 'error') color = '#ff1744';
    if (type === 'warning') color = '#ffea00';
    let dong = document.createElement('div');
    dong.style.marginBottom = '6px';
    dong.innerHTML = `<span style="color:${color}; font-family:monospace;">◈ ${text}</span>`;
    oNoiDung.appendChild(dong);
    oNoiDung.scrollTop = oNoiDung.scrollHeight;
  }

  ghiLog('Hệ thống Menu NekoVCheat sẵn sàng...', 'info');

  const coCsrfToken = document.querySelector('input[name="_csrfToken"]') !== null;
  if (coCsrfToken) {
    ghiLog('Đã tiếp cận trang xác thực mã. Đang kiểm tra captcha...');
    let htmlTrang = document.body.innerHTML;
    if (htmlTrang.includes('math_captcha')) {
      let vanBan = document.documentElement.textContent;
      let matchToan = vanBan.match(/(\d+)\s*([\+\-\*])\s*(\d+)\s*=\s*\?/);
      if (matchToan) {
        let soA = parseInt(matchToan[1]), pheTinh = matchToan[2], soB = parseInt(matchToan[3]);
        let kq = pheTinh === '+' ? soA + soB : pheTinh === '-' ? soA - soB : soA * soB;
        let oInput = document.querySelector('input[name="math_captcha_response"]') || document.getElementById('math-captcha-response');
        if (oInput) {
          oInput.value = kq;
          ghiLog('Tự động giải xong captcha toán học!', 'success');
          setTimeout(() => { oInput.form.submit(); }, 1000);
        }
      }
    }
    return;
  }

  if (maNhiemVu) {
    layCacheRedirect(maNhiemVu);
  } else {
    quetChuTuDong();
  }

  // VỊ TRÍ 1: Xử lý khi có sẵn dữ liệu Cache cũ từ link.json
  function layCacheRedirect(khoaCache) {
    ghiLog(`Đang kiểm tra dữ liệu cấu hình từ máy chủ...`);
    GM_xmlhttpRequest({
      method: 'GET',
      url: CONFIG_URL + '?t=' + new Date().getTime(),
      onload: function (phanHoiCache) {
        try {
          let jsonCache = JSON.parse(phanHoiCache.responseText);
          window.CONFIG_CHUYEN_HUONG = jsonCache;
          if (jsonCache.enabled && jsonCache.redirects && jsonCache.redirects[khoaCache]) {
            let tenMienCache = jsonCache.redirects[khoaCache];
            ghiLog(`Tìm thấy dữ liệu Cache: ${tenMienCache}`, 'success');
            
            // Ép mở Tab mới thay vì gọi chạy ngầm vượt link
            chuyenHuongDenTrangNhiemVu(tenMienCache);
          } else {
            ghiLog('Không có dữ liệu lưu trữ sẵn. Bắt đầu quét ảnh...');
            quetAnhVaGiaiMa();
          }
        } catch (e) {
          quetAnhVaGiaiMa();
        }
      },
      onerror: function () {
        quetAnhVaGiaiMa();
      }
    });
  }

  function quetAnhVaGiaiMa() {
    let cacAnh = Array.from(document.querySelectorAll('img')).filter(img => {
      if (!img.src) return false;
      let src = img.src.toLowerCase();
      return src.includes('wp-content/uploads/') && !src.includes('logo') && !src.includes('google');
    });
    if (cacAnh.length === 0) {
      ghiLog('Không tìm thấy ảnh hướng dẫn nhiệm vụ nào trên trang.', 'warning');
      return quetChuTuDong();
    }
    let urlAnhDich = cacAnh[0].src.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
    ghiLog(`Phát hiện ảnh gốc: ${urlAnhDich.split('/').pop()}`);
    
    GM_xmlhttpRequest({
      method: 'GET',
      url: urlAnhDich,
      responseType: 'blob',
      onload: function (resBlob) {
        let urlObj = URL.createObjectURL(resBlob.response);
        let objAnh = new Image();
        objAnh.onload = function () {
          catKhungAnhGoc(objAnh, function (blobDaCat) {
            URL.revokeObjectURL(urlObj);
            guiLenApiAI(blobDaCat);
          });
        };
        objAnh.src = urlObj;
      },
      onerror: function () {
        quetChuTuDong();
      }
    });
  }

  function catKhungAnhGoc(oAnh, callback) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = oAnh.naturalWidth || oAnh.width;
    canvas.height = oAnh.naturalHeight || oAnh.height;
    ctx.drawImage(oAnh, 0, 0);
    try {
      let duLieuAnh = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let pixels = duLieuAnh.data;
      let xNho = canvas.width, yNho = canvas.height, xLon = 0, yLon = 0, check = false;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          let i = (y * canvas.width + x) * 4;
          if (pixels[i] > 120 && pixels[i] > pixels[i+1] * 1.5 && pixels[i] > pixels[i+2] * 1.5) {
            if (x < xNho) xNho = x; if (x > xLon) xLon = x; if (y < yNho) yNho = y; if (y > yLon) yLon = y;
            check = true;
          }
        }
      }
      if (!check) return canvas.toBlob(b => callback(b), 'image/jpeg', 0.9);
      let p = 20; xNho = Math.max(0, xNho - p); yNho = Math.max(0, yNho - p); xLon = Math.min(canvas.width, xLon + p); yLon = Math.min(canvas.height, yLon + p);
      let canvasDaCat = document.createElement('canvas');
      canvasDaCat.width = xLon - xNho; canvasDaCat.height = yLon - yNho;
      canvasDaCat.getContext('2d').drawImage(canvas, xNho, yNho, xLon - xNho, yLon - yNho, 0, 0, xLon - xNho, yLon - yNho);
      canvasDaCat.toBlob(b => callback(b), 'image/jpeg', 0.9);
    } catch (e) {
      canvas.toBlob(b => callback(b), 'image/jpeg', 0.9);
    }
  }

  // VỊ TRÍ 2: Xử lý khi AI Kolosal trả dữ liệu domain về thành công
  function guiLenApiAI(blobAnh) {
    ghiLog('Đang tải ảnh lên hệ thống AI Kolosal để xử lý...');
    let formData = new FormData();
    formData.append('image', blobAnh, 'image.jpg');
    formData.append('language', 'auto');
    formData.append('custom_schema', JSON.stringify(SCHEMA_OCR));

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://api.kolosal.ai/public/ocr/form',
      headers: { 'Origin': 'https://app.kolosal.ai', 'Referer': 'https://app.kolosal.ai/' },
      data: formData,
      onload: function (resOcr) {
        try {
          if (resOcr.status !== 200) return quetChuTuDong();
          let json = JSON.parse(resOcr.responseText);
          let domains = (json.target_domain || '').trim().toLowerCase();
          
          if (domains && !domains.includes('...')) {
            ghiLog(`AI nhận diện thành công trang đích: ${domains}`, 'success');
            dongBoServer(maNhiemVu, domains);
            
            // Ép mở Tab mới thay vì gọi chạy ngầm vượt link
            chuyenHuongDenTrangNhiemVu(domains);
          } else {
            ghiLog('AI không nhận diện rõ từ khóa. Chuyển sang quét text...', 'warning');
            quetChuTuDong();
          }
        } catch (e) { quetChuTuDong(); }
      },
      onerror: function () { quetChuTuDong(); }
    });
  }

  // VỊ TRÍ 3: Xử lý khi tìm thấy bằng văn bản text thường trên trang
  function quetChuTuDong() {
    ghiLog('Đang tiến hành lọc tìm từ khóa văn bản trên trang...');
    let text = document.body ? document.body.innerText : '';
    let matches = text.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,6})/g);
    let timThay = null;
    if (matches) {
      for (let host of matches) {
        if (!host.includes('google') && !host.includes('linkhuongdan') && !host.includes('totreview') && !host.includes('uptolink')) {
          timThay = host;
          break;
        }
      }
    }
    if (timThay) {
      // Ép mở Tab mới thay vì gọi chạy ngầm vượt link
      chuyenHuongDenTrangNhiemVu(timThay);
    } else {
      ghiLog('Không tìm thấy bất kỳ manh mối nào. Hãy nhập tay nếu cần!', 'error');
    }
  }

  function dongBoServer(k, d) {
    if (!k) return;
    GM_xmlhttpRequest({
      method: 'POST',
      url: SAVE_URL + '?action=save',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ key: k, domain: d })
    });
  }

  // Giữ lại các hàm xử lý mã hóa phụ trợ để không làm gãy cấu trúc script
  function layOrigin(url) { try { return new URL(url).origin; } catch (e) { return ''; } }
})();
