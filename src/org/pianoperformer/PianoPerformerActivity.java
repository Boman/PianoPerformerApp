package org.pianoperformer;

import org.apache.cordova.DroidGap;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings.RenderPriority;

public class PianoPerformerActivity extends DroidGap {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

		super.loadUrl("file:///android_asset/www/index.html");
		appView.getSettings().setRenderPriority(RenderPriority.HIGH);
	}
}
