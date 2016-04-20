<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultAdminController extends Controller {

	/**
	 * @Route("/admin", name="admin")
	 */
	public function defaultAction(Request $request) {

		return $this->redirectToRoute('admin-media-items', [
		]);
	}
}
