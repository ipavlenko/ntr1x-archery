<?php

namespace NTR1X\OfferBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class OfferController extends Controller {

	public function itemsAction($sid, $category) {

		$c = $this
			->getDoctrine()
			->getRepository('NTR1XOfferBundle:Category')
			->findOneByName($category);

		return $this->render('NTR1XOfferBundle:section-offers.html.twig', [

			'sid' => $sid,

			'category' => $c,

			'offers' => $this
				->getDoctrine()
				->getRepository('NTR1XOfferBundle:Offer')
				->findBy(['category' => $c])
		]);
	}
}
