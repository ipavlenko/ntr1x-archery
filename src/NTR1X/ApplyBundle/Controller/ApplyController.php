<?php

namespace NTR1X\ApplyBundle\Controller;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;
use NTR1X\ApplyBundle\Form\Transformer\CategoryTransformer;
use NTR1X\ApplyBundle\Form\Transformer\ApplyTransformer;
use NTR1X\ApplyBundle\Entity\Apply;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;


class ApplyController extends Controller
{
	public function buttonAction($sid) {

		$view = [
			'sid' => $sid,
		];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view) {
			$view['categories'] = $this
				->getDoctrine()
				->getRepository('NTR1XApplyBundle:Category')
				->findAll(['title'=>'asc'])
			;
		});

		return $this->render('NTR1XApplyBundle:section-apply.html.twig', $view);
	}

	/**
	 * @Route("/apply/submit", name = "apply-submit")
	 */
	public function applyAction(Request $request) {

		$em = $this->getDoctrine()->getManager();

		$view = [];

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view) {

			$data = (new FormBuilder())
				->add('$.content.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
				->add('$.content.applicant', FormField::TYPE_VALUE)
				->add('$.content.email', FormField::TYPE_VALUE)
				->add('$.content.phone', FormField::TYPE_VALUE)
				->add('$.content.subject', FormField::TYPE_VALUE)
				->add('$.content.message', FormField::TYPE_VALUE)
				->build()
				->handleRequest($request)
			;

			$apply = (new Apply())
				->setCategory($data->modelData['$.content.category'])
				->setPublished(new \DateTime('NOW'))
				->setApplicant($data->modelData['$.content.applicant'])
				->setEmail($data->modelData['$.content.email'])
				->setPhone($data->modelData['$.content.phone'])
				->setSubject($data->modelData['$.content.subject'])
				->setMessage($data->modelData['$.content.message'])
			;

			$em->persist($apply);
			$em->flush();

			$view['id'] = $apply->getId();
		});

		$response = (new Response())
			->setContent(json_encode($view))
			->setStatusCode(Response::HTTP_OK)
		;

		$response->headers->set('Content-Type', 'application/json');

		return $response;
	}

}
