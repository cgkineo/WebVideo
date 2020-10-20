// # Setup stream parts

  const context1 = new WebVideo.VideoContext(document.querySelector('canvas'));

  const video1 = context1.createElementSource(document.querySelector('#video1'));
  const video2 = context1.createElementSource(document.querySelector('#video2'));

  const sepia1 = new WebVideo.SepiaNode(context1, {
    amount: 0
  });

  const color2 = new WebVideo.ColorNode(context1, {
    contrast: 0,
    brightness: 0,
    hue: 0,
    saturation: 0
  });

  /**
   * Use WebVideo.Fade or WebVideo.Displacement here
   */
  const fader1 = new WebVideo.DisplacementNode(context1, {
    amount: 0,
    /**
     * Try out different displacement images, displacement.jpg, displacement1.jpg, displacement2.jpg
     * The darks and lights transition differently.
     */
    displacement: "./displacement2.jpg"
  });

// # Plumb stream together so that data flows appropriately

  // ## fader1 is pulling data from video1 and video2 and pushing data to canvas
  video1.connect(sepia1).connect(fader1, 0);
  video2.connect(color2).connect(fader1, 1);
  fader1.connect(context1.destination);

  // ## simple video > canvas
  // video1.connect(canvas1);

  // ## simple video > color change > canvas
  // video2.connect(color2).connect(canvas1);

// # Manage UI controls

  function render() {
    sepia1.amount.value = parseFloat($('.sepia1').val() / 100);
    color2.hue.value = parseFloat($('.hue2').val() / 100);
    color2.contrast.value = parseFloat($('.contrast2').val() / 100);
    color2.brightness.value = parseFloat($('.brightness2').val() / 100);
    color2.saturation.value = parseFloat($('.saturation2').val() / 100);
    fader1.amount.value = parseFloat($('.amount').val()) / 100;
  }

  $(".control").on("change mousemove", function() {
    render();
  });

  document.onload = render;
  setTimeout(render, 500);
