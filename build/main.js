// # Setup stream parts

/*   const context1 = new WebVideo.VideoContext(document.querySelector('canvas'));

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

  const fader1 = new WebVideo.DisplacementNode(context1, {
    amount: 0,
    displacement: "./displacement2.jpg"
  }); */

// # Plumb stream together so that data flows appropriately

  // ## fader1 is pulling data from video1 and video2 and pushing data to canvas
  /* video1.connect(sepia1).connect(fader1, 0);
  video2.connect(color2).connect(fader1, 1);
  fader1.connect(context1.destination); */

  $(document).ready(() => {
    $('#btn').on('click', () => {
      const context1 = new WebVideo.VideoContext(document.querySelector('canvas'));
      const video1 = context1.createElementSource(document.querySelector('#video1'));
      const video2 = context1.createElementSource(document.querySelector('#video2'));
      const fader1 = new WebVideo.FadeNode(context1, {amount: 0 });
      
      context1.resume();

      video1.connect(fader1, 0);
      video2.connect(fader1, 1);

      fader1.connect(context1.destination);

      video1.playing.setValueAtTime(1, 0);

      video1.playing.setValueAtTime(0, 5000);
      video2.playing.setValueAtTime(1, 5000);

      video1.playing.setValueAtTime(1, 10000);
      video2.playing.setValueAtTime(0, 10000);

      video1.playing.setValueAtTime(0, 15000);
      video2.playing.setValueAtTime(1, 15000);

      video2.playhead.setValueAtTime(30, 18000);
      video2.playhead.setValueAtTime(60, 20000);
      video2.playhead.setValueAtTime(90, 22000);
      video2.playhead.setValueAtTime(120, 24000);
      video2.playhead.setValueAtTime(150, 26000);
      video2.playhead.setValueAtTime(180, 28000);

      fader1.amount.setValueAtTime(1, 5000);
      fader1.amount.setValueAtTime(0, 10000);
      fader1.amount.setValueAtTime(1, 15000);
    });
  });




  // ## simple video > canvas
  // video1.connect(canvas1);

  // ## simple video > color change > canvas
  // video2.connect(color2).connect(canvas1);

// # Manage UI controls

  function render() {return;
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
