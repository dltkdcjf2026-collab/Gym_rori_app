param([int]$Port = 8080)

# 개발/테스트용 정적 파일 서버 (localhost 전용, 외부 접속 불가)
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.ico' = 'image/x-icon'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
    # 경로 이탈(../) 차단
    if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
      $ctx.Response.StatusCode = 404
      $ctx.Response.Close()
      continue
    }
    try {
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $ctx.Response.ContentType = $type
      $ctx.Response.AddHeader('Cache-Control', 'no-store')
      $ctx.Response.SendChunked = $true
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      Write-Host "request error: $($_.Exception.Message)"
    } finally {
      $ctx.Response.Close()
    }
  }
} finally {
  $listener.Stop()
}
