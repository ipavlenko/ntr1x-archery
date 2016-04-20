<?php

namespace NTR1X\MediaBundle\Search;

use NTR1X\SearchBundle\Decorator\DecoratorInterface;
use NTR1X\SearchBundle\Decorator\DecoratorManager;
use NTR1X\MediaBundle\Twig\MediaTwigExtension;

use Doctrine\ORM\EntityManager;


class MediaDecorator implements DecoratorInterface {

	public function __construct(EntityManager $em) {
		$this->em = $em;
	}

	public function decorate($items) {

		$ids = [];
		$array = [];
		$occurrences = [];

		$types = [
			'news',
			'video',
			'biography',
		];

		foreach ($items as $key=>&$item) {

			if (in_array($item['type'], $types)) {
				$ids[$item['id']] = $item['id'];
			}

			$array[$key] = $item;
		}

		$result = $this->em
			->createQuery("
				SELECT m
				FROM
					NTR1X\MediaBundle\Entity\Media m
					INNER JOIN NTR1X\SearchBundle\Entity\Search s WITH m.search = s
				WHERE s.id IN (:ids)
			")
			->setParameter(":ids", $ids)
			->getResult();

		$joined = [];
		foreach ($result as $item) {
			$joined[$item->getSearch()->getId()] = $item;
		}

		foreach ($array as $key=>&$item) {
			if (in_array($item['type'], $types)) {
				$media = @$joined[$item['id']];
				if ($media != null) {

					$item['title'] = $media->getTitle();
					$item['promo'] = $media->getPromo();
					$item['content'] = $media->getDescription();
					$item['date'] = $media->getPublished();

					$tags = [];
					foreach ($media->getTags() as $tag) {
						$tags[] = $tag->getName();
					}

					$item['tags'] = $tags;

					$thumbnail = $media->getThumbnail();
					if ($thumbnail != null) {
						$item['thumbnail'] = $thumbnail->getWebPath();
					} else {
						$video = $media->getVideo();

						if (!empty($video)) {
							$item['thumbnail'] = (new MediaTwigExtension())->videoFilter($video, 'thumbnail');
						}
					}
				}
			}
		}

		return $array;
	}
}