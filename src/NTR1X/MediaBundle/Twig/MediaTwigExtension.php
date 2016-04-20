<?php

namespace NTR1X\MediaBundle\Twig;

class MediaTwigExtension extends \Twig_Extension {

	public function getFilters() {

		return [
			new \Twig_SimpleFilter('video', array($this, 'videoFilter')),
		];
	}

	public function videoFilter($url, $variant) {

		if (empty($url)) {
			return null;
		}

		$matches = [];

		switch(parse_url($url, PHP_URL_HOST)) {
			case 'youtube.com':
			case 'www.youtube.com':
			case 'youtu.be':
			case 'm.youtube.com':
				preg_match("/^(?:http(?:s)?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/))([^\?&\"'>]+)/", $url, $matches);
				if (count($matches) > 1) {
					switch($variant) {
						case 'thumb':
						case 'thumbnail':
							return sprintf("http://img.youtube.com/vi/%s/0.jpg", $matches[1]);
						case 'video':
						default:
							return sprintf("https://www.youtube.com/embed/%s", $matches[1]);
					}
				}
				return null;
		}
	}

	public function getName() {

		return 'media_extension';
	}
}