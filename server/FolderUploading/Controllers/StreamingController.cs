using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using FolderUploading.Filters;
using FolderUploading.Models;
using FolderUploading.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;

namespace FolderUploading.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StreamingController : ControllerBase
    {
        private readonly string _targetFilePath;
        private readonly ILogger<StreamingController> _logger;

        // Get the default form options so that we can use them to set the default 
        // limits for request body data.
        private static readonly FormOptions _defaultFormOptions = new FormOptions();

        public StreamingController(
            ILogger<StreamingController> logger,
            IConfiguration configuration)
        {
            _logger = logger;
            _targetFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, configuration.GetValue<string>("UploadsFolderName"));
        }

        [HttpGet("handshake")]
        public ActionResult<HandshakeResponse> Handshake()
        {
            var response = new HandshakeResponse
            {
                UploadId = Guid.NewGuid()
            };

            return Ok(response);
        }

        [HttpPost("upload")]
        [DisableFormValueModelBinding]
        public async Task<IActionResult> UploadPhysical([FromQuery] Guid uploadId)
        {
            if (!MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
            {
                ModelState.AddModelError("File", $"The request couldn't be processed (Error 1).");

                return BadRequest(ModelState);
            }

            var boundary = MultipartRequestHelper.GetBoundary(MediaTypeHeaderValue.Parse(Request.ContentType), _defaultFormOptions.MultipartBoundaryLengthLimit);
            var reader = new MultipartReader(boundary, HttpContext.Request.Body);
            var section = await reader.ReadNextSectionAsync();

            while (section != null)
            {
                var hasContentDispositionHeader = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);

                if (hasContentDispositionHeader)
                {
                    // This check assumes that there's a file
                    // present without form data. If form data
                    // is present, this method immediately fails
                    // and returns the model error.
                    if (!MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
                    {
                        ModelState.AddModelError("File", $"The request couldn't be processed (Error 2).");
                        return BadRequest(ModelState);
                    }
                    else
                    {
                        var streamedFileContent = await FileHelpers.ProcessStreamedFile(section, contentDisposition, ModelState);

                        if (!ModelState.IsValid)
                        {
                            return BadRequest(ModelState);
                        }

                        var filePath = Path.Combine(_targetFilePath, uploadId.ToString(), contentDisposition.FileName.Value);
                        var fileFolderPath = Path.GetDirectoryName(filePath);

                        if (!Directory.Exists(fileFolderPath))
                        {
                            Directory.CreateDirectory(fileFolderPath);
                        }

                        using (var targetStream = System.IO.File.Create(filePath))
                        {
                            await targetStream.WriteAsync(streamedFileContent);
                        }
                    }
                }

                // Drain any remaining section body that hasn't been consumed and
                // read the headers for the next section.
                section = await reader.ReadNextSectionAsync();
            }

            return Created(nameof(StreamingController), null);
        }
    }
}
