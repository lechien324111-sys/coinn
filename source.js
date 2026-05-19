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
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';
  
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

  // HÀM CHUYỂN HƯỚNG SANG TRANG LÀM NHIỆM VỤ (ĐÃ XÓA SẠCH GOOGLE)
  function moTabTrangNhiemVu(chuoiTenMien) {
    let sachChuoi = chuoiTenMien.replace(/https?:\/\//i, '').replace(/\/$/, '').trim();
    // Nếu AI quét thiếu đuôi dấu chấm, ép tự động thêm .com vào sau tên thương hiệu
    let tenMienChuan = sachChuoi.includes('.') ? sachChuoi : `${sachChuoi}.com`;
    
    ghiLog(`Đang mở trang đích làm nhiệm vụ: https://${tenMienChuan}`, 'success');
    window.open(`https://${tenMienChuan}`, '_blank');
  }

  if (thamSoUrl.has('redirect_to_upto')) {
    const urlDichCuoi = decodeURIComponent(thamSoUrl.get('redirect_to_upto'));
    document.body.innerHTML = '\n            <div style="background:#0a0a0a; color:#e0e0e0; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:\'Segoe UI\', sans-serif; font-size: 20px;">\n                <h2>ĐANG ĐIỀU HƯỚNG AN TOÀN</h2>\n                <p style="color:#888; font-size: 14px; margin-top: 10px;">Xin vui lòng chờ trong giây lát...</p>\n            </div>';
    setTimeout(() => { window.location.href = urlDichCuoi; }, 1000);
    return;
  }

  const laHostCanBypass = tenMien.includes('linkhuongdan.online') || tenMien.includes('totreview.com');
  const coCsrfToken = document.querySelector('input[name="_csrfToken"]') !== null;
  const REGEX_LINK_GOC = /<a[^>]+href=["']([^"']+)["'][^>]*>Link\s*Gốc<\/a>/i;
  const matchLinkGoc = document.body.innerHTML.match(REGEX_LINK_GOC);
  if (!laHostCanBypass && !coCsrfToken && !matchLinkGoc) return;

  let theStyle = document.createElement('style');
  theStyle.innerHTML = "\n        .lux-panel { position: fixed; bottom: 25px; right: 25px; width: 480px; height: 350px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200, 200, 200, 0.15); border-radius: 12px; z-index: 2147483647; display: flex; flex-direction: column; overflow: hidden; font-family: sans-serif; }\n        .lux-header { background: #121212; color: #f0f0f0; padding: 10px 15px; font-size: 13px; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }\n        .lux-body { flex-grow: 1; padding: 12px 15px; overflow-y: auto; background: #0a0a0a; }\n        .log-entry { margin-bottom: 6px; display: flex; align-items: flex-start; font-family: monospace; font-size: 12px; }\n    ";
  document.head.appendChild(theStyle);
  let oPanel = document.createElement('div'); oPanel.className = 'lux-panel';
  let oTieuDe = document.createElement('div'); oTieuDe.className = 'lux-header';
  oTieuDe.innerHTML = '<span>✦ NEKOVCHEAT BYPASS</span>';
  let oNoiDung = document.createElement('div'); oNoiDung.className = 'lux-body';
  oPanel.appendChild(oTieuDe); oPanel.appendChild(oNoiDung); document.body.appendChild(oPanel);

  function ghiLog(thongDiep, mucDo = 'info') {
    let mauSac = '#00b0ff'; if (mucDo === 'success') mauSac = '#00e676'; if (mucDo === 'warn') mauSac = '#ffea00'; if (mucDo === 'ai') mauSac = '#e040fb';
    let dongLog = document.createElement('div'); dongLog.className = 'log-entry';
    dongLog.innerHTML = `<span style="color:${mauSac}">◈ ${thongDiep}</span>`;
    oNoiDung.appendChild(dongLog); oNoiDung.scrollTop = oNoiDung.scrollHeight;
  }

  ghiLog('Hệ thống Menu NekoVCheat sẵn sàng...', 'info');

  if (coCsrfToken || matchLinkGoc) {
    if (matchLinkGoc) { setTimeout(() => { window.location.href = matchLinkGoc[1]; }, 1000); return; }
    let oForm = document.getElementById('link-view') || document.querySelector('form');
    if (!oForm) return;
    let htmlTrang = document.body.innerHTML;
    if (htmlTrang.includes('math_captcha')) {
      let matchToan = document.documentElement.textContent.match(/(\d+)\s*([\+\-\*])\s*(\d+)\s*=\s*\?/);
      if (matchToan) {
        let soA = parseInt(matchToan[1]), pheTinh = matchToan[2], soB = parseInt(matchToan[3]);
        let kq = pheTinh === '+' ? soA + soB : pheTinh === '-' ? soA - soB : soA * soB;
        let oInput = document.getElementById('math-captcha-response') || document.querySelector('input[name="math_captcha_response"]');
        if (oInput) { oInput.value = kq; setTimeout(() => { oInput.form.submit(); }, 1000); }
      }
    }
    return;
  }

  if (laHostCanBypass && maNhiemVu) layCacheRedirect(maNhiemVu);

  function layCacheRedirect(khoaCache) {
    ghiLog('Đang kết nối kiểm tra cơ sở dữ liệu...', 'info');
    GM_xmlhttpRequest({
      method: 'GET',
      url: `${CONFIG_URL}?t=${new Date().getTime()}`,
      onload: function (phanHoiCache) {
        try {
          let jsonCache = JSON.parse(phanHoiCache.responseText);
          if (jsonCache.enabled && jsonCache.redirects && jsonCache.redirects[khoaCache]) {
            let tenMienCache = jsonCache.redirects[khoaCache];
            ghiLog(`Tìm thấy bản lưu Cache: ${tenMienCache}`, 'success');
            moTabTrangNhiemVu(tenMienCache);
          } else {
            ghiLog('Nhiệm vụ mới. Khởi động AI quét hình ảnh...', 'warn');
            batDauPipelineOCR();
          }
        } catch (e) { batDauPipelineOCR(); }
      },
      onerror: function () { batDauPipelineOCR(); },
    });
  }

  function batDauPipelineOCR() {
    let cacAnhUngCu = Array.from(document.querySelectorAll('img')).filter((theImg) => {
      if (!theImg.src) return false;
      let src = theImg.src.toLowerCase();
      return src.includes('wp-content/uploads/') && !src.includes('logo') && !src.includes('google');
    });
    if (cacAnhUngCu.length === 0) return hienOInputTay();
    let urlAnhDich = cacAnhUngCu[0].src.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
    quetAnhKeTiep([urlAnhDich], 0);
  }

  function quetAnhKeTiep(danhSachUrl, chiSoUrl) {
    if (chiSoUrl >= danhSachUrl.length) return hienOInputTay();
    ghiLog('Đang gửi ảnh lên hệ thống AI Kolosal...', 'info');
    GM_xmlhttpRequest({
      method: 'GET', url: danhSachUrl[chiSoUrl], responseType: 'blob',
      onload: function (phanHoiAnh) {
        let urlObject = URL.createObjectURL(phanHoiAnh.response);
        let objAnh = new Image();
        objAnh.onload = function () {
          let canvas = document.createElement('canvas');
          canvas.width = objAnh.naturalWidth || objAnh.width; canvas.height = objAnh.naturalHeight || objAnh.height;
          canvas.getContext('2d').drawImage(objAnh, 0, 0);
          canvas.toBlob((blob) => { URL.revokeObjectURL(urlObject); goiOCR(blob); }, 'image/jpeg', 0.9);
        };
        objAnh.src = urlObject;
      },
      onerror: function () { hienOInputTay(); },
    });
  }

  function goiOCR(blobAnh) {
    ghiLog('AI đang bóc tách phân tích dữ liệu ảnh...', 'ai');
    let formDataOCR = new FormData();
    formDataOCR.append('image', blobAnh, 'image.jpg');
    formDataOCR.append('language', 'auto');
    formDataOCR.append('custom_schema', JSON.stringify(SCHEMA_OCR));
    GM_xmlhttpRequest({
      method: 'POST', url: 'https://api.kolosal.ai/public/ocr/form',
      headers: { Origin: 'https://app.kolosal.ai', Referer: 'https://app.kolosal.ai/' },
      data: formDataOCR,
      onload: function (phanHoiOCR) {
        try {
          let jsonOCR = JSON.parse(phanHoiOCR.responseText);
          let tenMienPhatHien = (jsonOCR.target_domain || '').trim().toLowerCase();
          if (tenMienPhatHien && !tenMienPhatHien.includes('...')) {
            ghiLog(`AI bóc tách thành công từ khóa: ${tenMienPhatHien}`, 'success');
            
            // Đồng bộ máy chủ lưu trữ dữ liệu
            let dBo = tenMienPhatHien.includes('.') ? tenMienPhatHien : `${tenMienPhatHien}.com`;
            GM_xmlhttpRequest({ method: 'POST', url: SAVE_URL, headers: { 'Content-Type': 'application/json' }, data: JSON.stringify({ key: maNhiemVu, domain: dBo }) });
            
            // Gọi hàm mở thẳng trang nhiệm vụ
            moTabTrangNhiemVu(tenMienPhatHien);
          } else {
            ghiLog('AI không tìm thấy tên miền hợp lệ.', 'warn');
            hienOInputTay();
          }
        } catch (e) { hienOInputTay(); }
      },
      onerror: function () { hienOInputTay(); },
    });
  }

  function hienOInputTay() {
    if (document.getElementById('manual-domain-input')) return;
    ghiLog('Hãy nhập thủ công tên miền nếu cần.', 'warn');
    let oNhapTay = document.createElement('div');
    oNhapTay.style.cssText = 'margin-top: 10px; display: flex; gap: 8px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;';
    oNhapTay.innerHTML = '<input type="text" id="manual-domain-input" placeholder="Nhập tên miền..." style="flex-grow: 1; padding: 8px 12px; background: #000; color: #fff; border: 1px solid #333;"><button id="manual-domain-btn" style="padding: 8px 16px; background: #00b0ff; color: #fff; border: none;">OK</button>';
    oNoiDung.appendChild(oNhapTay);
    document.getElementById('manual-domain-btn').addEventListener('click', () => {
      let inputTho = document.getElementById('manual-domain-input').value.trim();
      if (inputTho) moTabTrangNhiemVu(inputTho);
    });
  }
})();
