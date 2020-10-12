// # Setup stream parts

  const video1 = new Stream.Input({
    element: '#video1'
  });

  const video2 = new Stream.Input({
    element: '#video2'
  });

  const sepia1 = new Stream.Sepia({
    amount: 0
  });

  const color2 = new Stream.Color({
    contrast: 0,
    brightness: 0,
    hue: 0,
    saturation: 0
  });

  /**
   * Use Stream.Fade or Stream.Displacement here
   */
  const fader1 = new Stream.Displacement({
    amount: 0,
    /**
     * Try out different displacement images, displacement.jpg, displacement1.jpg, displacement2.jpg
     * The darks and lights transition differently.
     */
    displacement: "./displacement2.jpg"
  });

  const canvas1 = new Stream.Output({
    element: 'canvas'
  });


// # Plumb stream together so that data flows appropriately

  // ## fader1 is pulling data from video1 and video2 and pushing data to canvas1
  fader1.drain([
    video1.pipe(sepia1),
    video2.pipe(color2)
  ]).pipe(canvas1);

  // ## simple video > canvas
  // video1.pipe(canvas1);

  // ## simple video > color change > canvas
  // video2.pipe(color2).pipe(canvas1);

// # Manage UI controls

  function render() {
    sepia1.amount = parseFloat($('.sepia1').val() / 100);
    color2.hue = parseFloat($('.hue2').val() / 100);
    color2.contrast = parseFloat($('.contrast2').val() / 100);
    color2.brightness = parseFloat($('.brightness2').val() / 100);
    color2.saturation = parseFloat($('.saturation2').val() / 100);
    fader1.amount = parseFloat($('.amount').val()) / 100;
  }

  $(".control").on("change mousemove", function() {
    render();
  });

  document.onload = render;
  setTimeout(render, 500);
