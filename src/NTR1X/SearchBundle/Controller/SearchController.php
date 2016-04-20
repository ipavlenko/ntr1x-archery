<?php

namespace NTR1X\SearchBundle\Controller;

use NTR1X\SearchBundle\Search\Engine;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class SearchController extends Controller
{
	public function searchAction($sid, $search) {

		return $this->render('NTR1XSearchBundle:section-search.html.twig', [
			'sid' => $sid,
			'search' => [
				'query' => $search['query'],
				'results' => [
					'title' => @$search['results']['title'] ?: 'Результаты поиска',
				],
			],
		]);
	}

	public function resultsAction($sid, $search) {

		$engine = new Engine(
			'http://solr.burmatov.com',
			'collection_dist_ru'
		);

		$view = [
			'sid' => $sid,
			'search' => [
				'query' => [
					'category' => $search['query']['category'],
					'string' => $search['query']['string'],
					'tag' => $search['query']['tag'],
					'date' => $search['query']['date'],
					'limit' => 10,
					'offset' => 0,
				],
				'results' => [
					'title' => @$search['results']['title'] ?: 'Результаты поиска',
					'count' => 0,
					'items' => []
				],
			],
		];

		$filters = array();

		if (!empty($search['query']['category'])) {
			$filters['type'] = $search['query']['category'];
		}

		if (!empty($search['query']['tag'])) {
			$filters['tags'] = $search['query']['tag'];
		}

		if (!empty($search['query']['date'])) {
			$d = \DateTime::createFromFormat('Y-m-d', $search['query']['date']);
			$d1 = $d->format('Y-m-d');
			$d2 = $d->add(new \DateInterval('P1D'))->format('Y-m-d');
			$filters['date'] = sprintf("[%sT00:00:00Z TO %sT00:00:00Z]", $d1, $d2);
		}

		$view['search']['results']['count'] = $engine->load(
			$view['search']['results']['items'],
			$view['search']['query']['string'],
			$filters,
			$view['search']['query']['offset'],
			$view['search']['query']['limit'],
			function(&$row) {
			//
			}
		);

		$decorator = $this->get('ntr1_x_search.decorator.manager');

		$view['search']['results']['items'] = $decorator->decorate($view['search']['results']['items']);

		// $c = $this
		// 	->getDoctrine()
		// 	->getRepository('NTR1XMediaBundle:Category')
		// 	->findOneByName($type);

		return $this->render('NTR1XSearchBundle:section-results.html.twig', $view);

		// [

		// 	'sid' => $sid,

		// 	'title' => 'Результаты поиска',

		// 	'type' => $type,

		// 	'tags' => $this
		// 		->getDoctrine()
		// 		->getManager()
		// 		->createQuery("
		// 			SELECT DISTINCT t.name
		// 			FROM NTR1X\MediaBundle\Entity\Tag t
		// 				INNER JOIN NTR1X\MediaBundle\Entity\Media m WITH m = t.item
		// 			WHERE m.category = :category
		// 			ORDER BY t.name ASC
		// 		")
		// 		->setParameter("category", $c)
		// 		->getResult(),

		// 	'items' => $this
		// 		->getDoctrine()
		// 		->getRepository('NTR1XMediaBundle:Media')
		// 		->findBy(['category' => $c])
		// ]);
	}

	public function tagsAction($sid, $search) {

		$category = $this
			->getDoctrine()
			->getRepository('NTR1XMediaBundle:Category')
			->findOneByName(@$search['query']['category']);

		$view = [
			'sid' => $sid,
			'search' => $search,
			'category' => $category,
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
				->setParameter("category", $category)
				->getResult(),
		];

		return $this->render('NTR1XSearchBundle:section-tags.html.twig', $view);
	}
}
