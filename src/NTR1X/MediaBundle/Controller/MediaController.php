<?php

namespace NTR1X\MediaBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class MediaController extends Controller {

	public function itemsAction($sid, $category) {

		$c = $this
			->getDoctrine()
			->getRepository('NTR1XMediaBundle:Category')
			->findOneByName($category);

		return $this->render('NTR1XMediaBundle:section-media.html.twig', [

			'sid' => $sid,

			'category' => $c,

			'tags' => $this
				->getDoctrine()
				->getManager()
				->createQuery("
					SELECT DISTINCT t.name
					FROM NTR1X\MediaBundle\Entity\Tag t
						INNER JOIN NTR1X\MediaBundle\Entity\Media m WITH m = t.item
					WHERE m.category = :category
					ORDER BY t.name ASC
				")
				->setParameter("category", $c)
				->getResult(),

			'items' => $this
				->getDoctrine()
				->getRepository('NTR1XMediaBundle:Media')
				->findBy(['category' => $c], ['published' => 'DESC'], 3)
		]);
	}

	public function feedAction($sid, $category) {

		$c = $this
			->getDoctrine()
			->getRepository('NTR1XMediaBundle:Category')
			->findOneByName($category);

		return $this->render('NTR1XMediaBundle:section-feed.html.twig', [

			'sid' => $sid,

			'category' => $c,

			'items' => $this
				->getDoctrine()
				->getRepository('NTR1XMediaBundle:Media')
				->findBy(['category' => $c])
		]);
	}

	public function detailsAction($sid, $item) {

		return $this->render('NTR1XMediaBundle:section-details.html.twig', array(
			'sid' => $sid,
			'item' => $item,
		));
	}
}
